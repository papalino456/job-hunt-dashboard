'use client';

import { useState, useEffect, useRef } from 'react';
import { api, Attachment } from '@/lib/api';
import { 
  Paperclip, Upload, X, FileText, Download, Eye, Trash2, 
  File, FileImage, FileCode 
} from 'lucide-react';

interface AttachmentManagerProps {
  jobId: string;
}

const typeLabels: Record<string, string> = {
  cv: 'CV / Resume',
  cover_letter: 'Cover Letter',
  offer: 'Offer Letter',
  other: 'Other'
};

const typeColors: Record<string, string> = {
  cv: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  cover_letter: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  offer: 'bg-green-500/20 text-green-400 border-green-500/30',
  other: 'bg-steel-500/20 text-steel-400 border-steel-500/30'
};

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType === 'application/pdf') return FileText;
  if (mimeType.includes('word')) return FileText;
  return File;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentManager({ jobId }: AttachmentManagerProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAttachments();
  }, [jobId]);

  const loadAttachments = async () => {
    setLoading(true);
    try {
      const data = await api.getAttachments(jobId);
      setAttachments(data);
    } catch (err) {
      console.error('Failed to load attachments:', err);
      setError('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      for (const file of files) {
        await api.uploadAttachment(jobId, file, 'other');
      }
      await loadAttachments();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Delete this attachment?')) return;

    try {
      await api.deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (err) {
      setError('Failed to delete attachment');
    }
  };

  const handleTypeChange = async (attachmentId: string, newType: string) => {
    try {
      await api.updateAttachment(attachmentId, { type: newType });
      setAttachments(prev => prev.map(a => 
        a.id === attachmentId ? { ...a, type: newType as Attachment['type'] } : a
      ));
    } catch (err) {
      setError('Failed to update type');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-steel-600 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-steel-400" />
          <span className="text-sm font-medium text-steel-200">
            Attachments ({attachments.length})
          </span>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-600/30 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-3 h-3" />
              Upload
            </>
          )}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Empty State */}
      {attachments.length === 0 && !uploading && (
        <div className="text-center py-6 border-2 border-dashed border-steel-800 rounded-lg">
          <Paperclip className="w-8 h-8 text-steel-600 mx-auto mb-2" />
          <p className="text-sm text-steel-500">No attachments yet</p>
          <p className="text-xs text-steel-600 mt-1">Upload CVs, cover letters, or other documents</p>
        </div>
      )}

      {/* Attachment List */}
      <div className="space-y-2">
        {attachments.map(attachment => {
          const FileIcon = getFileIcon(attachment.mime_type);
          return (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 bg-steel-900/50 border border-steel-800 rounded-lg hover:border-steel-700 transition-colors"
            >
              <div className="w-10 h-10 rounded bg-steel-800 flex items-center justify-center flex-shrink-0">
                <FileIcon className="w-5 h-5 text-steel-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-steel-200 truncate">
                    {attachment.original_name}
                  </p>
                  <select
                    value={attachment.type}
                    onChange={(e) => handleTypeChange(attachment.id, e.target.value)}
                    className={`text-xs px-2 py-0.5 rounded border ${typeColors[attachment.type]} bg-transparent`}
                  >
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-steel-500">
                  {formatFileSize(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <a
                  href={api.getAttachmentViewUrl(attachment.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-steel-400 hover:text-steel-200 hover:bg-steel-800 rounded transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </a>
                
                <a
                  href={api.getAttachmentDownloadUrl(attachment.id)}
                  className="p-2 text-steel-400 hover:text-steel-200 hover:bg-steel-800 rounded transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                
                <button
                  onClick={() => handleDelete(attachment.id)}
                  className="p-2 text-steel-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
