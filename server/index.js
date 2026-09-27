import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  audience: String,
  source: String,
  category: String,
  frequency: String,
  moneyCost: String,
  timeCost: String,
  currentSolution: String
}, { timestamps: true });

const Problem = mongoose.model('Problem', problemSchema);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'problem-intelligence-api' }));

app.get('/api/problems', async (_req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 }).limit(100);
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: 'Unable to load problems' });
  }
});

app.post('/api/problems', async (req, res) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json(problem);
  } catch (error) {
    res.status(400).json({ error: 'Invalid problem data' });
  }
});

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => app.listen(port, () => console.log(`API running on ${port}`)))
    .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
} else {
  app.listen(port, () => console.log(`API running on ${port} (MongoDB not configured)`));
}
