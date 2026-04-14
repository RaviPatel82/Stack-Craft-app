import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.send('Route working 🚀');
});

export default router;
