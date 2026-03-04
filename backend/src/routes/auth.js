import express from 'express';

const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (password === process.env.PASSWORD) {
    req.session.authenticated = true;
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session error' });
      }
      res.json({ success: true });
    });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.get('/status', (req, res) => {
  res.json({ 
    authenticated: req.session?.authenticated || false 
  });
});

export default router;
