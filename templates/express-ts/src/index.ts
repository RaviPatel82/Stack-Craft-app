import express from 'express';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Hello from __PROJECT_NAME__ 🚀');
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
