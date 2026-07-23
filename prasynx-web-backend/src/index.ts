import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Web API is running' });
});

app.listen(port, () => {
  console.log(`Web backend running on http://localhost:${port}`);
});
