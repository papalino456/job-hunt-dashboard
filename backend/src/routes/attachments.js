import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import db from '../db/database-postgres.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Store files in memory — content goes straight to Postgres BYTEA
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`), false);
    }
  }
});

// All routes require authentication
router.use(requireAuth);

// Get all attachments for a job (metadata only — no file_data in listing)
router.get('/:jobId/attachments', async (req, res) => {
  try {
    const attachments = await db.all(
      `SELECT id, filename, original_name, mime_type, file_size, type, description, created_at
       FROM attachments WHERE job_id = $1 ORDER BY created_at DESC`,
      [req.params.jobId]
    );
    res.json(attachments);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload attachment(s) for a job
router.post('/:jobId/attachments', upload.array('files', 5), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { type = 'other', description = '' } = req.body;

    const job = await db.get('SELECT id FROM jobs WHERE id = $1', [jobId]);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const attachments = [];

    for (const file of req.files) {
      const id = uuidv4();
      const filename = `${id}${extname(file.originalname)}`;

      await db.run(
        `INSERT INTO attachments
           (id, job_id, filename, original_name, mime_type, file_size, file_data, type, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, jobId, filename, file.originalname, file.mimetype, file.size, file.buffer, type, description]
      );

      attachments.push({
        id,
        job_id: jobId,
        filename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        file_size: file.size,
        type,
        description
      });
    }

    res.status(201).json({ success: true, attachments, count: attachments.length });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Shared helper: fetch attachment and stream its bytes to the response
async function serveAttachment(attachmentId, disposition, res) {
  const attachment = await db.get(
    'SELECT id, original_name, mime_type, file_size, file_data FROM attachments WHERE id = $1',
    [attachmentId]
  );

  if (!attachment) {
    return res.status(404).json({ error: 'Attachment not found' });
  }

  if (!attachment.file_data) {
    return res.status(404).json({
      error: 'File data missing. This attachment was uploaded before in-DB storage was enabled. Please re-upload.'
    });
  }

  const buf = Buffer.isBuffer(attachment.file_data)
    ? attachment.file_data
    : Buffer.from(attachment.file_data);

  res.setHeader('Content-Type', attachment.mime_type);
  res.setHeader('Content-Disposition', `${disposition}; filename="${attachment.original_name}"`);
  res.setHeader('Content-Length', buf.length);
  res.end(buf);
}

// Download an attachment (forces browser save dialog)
router.get('/attachments/:attachmentId/download', async (req, res) => {
  try {
    await serveAttachment(req.params.attachmentId, 'attachment', res);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ error: error.message });
  }
});

// View an attachment inline (opens in browser tab)
router.get('/attachments/:attachmentId/view', async (req, res) => {
  try {
    await serveAttachment(req.params.attachmentId, 'inline', res);
  } catch (error) {
    console.error('Error viewing attachment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update attachment metadata
router.patch('/attachments/:attachmentId', async (req, res) => {
  try {
    const { type, description } = req.body;
    const updates = [];
    const params = [];
    let idx = 1;

    if (type !== undefined) {
      updates.push(`type = $${idx}`);
      params.push(type);
      idx++;
    }

    if (description !== undefined) {
      updates.push(`description = $${idx}`);
      params.push(description);
      idx++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(req.params.attachmentId);

    const result = await db.run(
      `UPDATE attachments SET ${updates.join(', ')} WHERE id = $${idx}`,
      params
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating attachment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete an attachment
router.delete('/attachments/:attachmentId', async (req, res) => {
  try {
    const result = await db.run(
      'DELETE FROM attachments WHERE id = $1',
      [req.params.attachmentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
