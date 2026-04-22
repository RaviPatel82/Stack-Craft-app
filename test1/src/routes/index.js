
const authRoutes = require('./auth.routes');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Route working 🚀');
});


router.use('/auth', authRoutes);

module.exports = router;

