import express from 'express';

const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  
  console.log('Login attempt, session ID:', req.sessionID);
  console.log('Session before:', req.session);
  
  if (password === process.env.PASSWORD) {
    req.session.authenticated = true;
    console.log('Session after setting auth:', req.session);
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session error' });
      }
      console.log('Session saved successfully');
      res.json({ success: true });
    });
  } else {
    console.log('Invalid password');
    res.status(401).json({ error: 'Invalid password' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.get('/status', (req, res) => {
  console.log('Auth status check, session:', req.session);
  res.json({ 
    authenticated: req.session?.authenticated || false 
  });
});

export default router;
