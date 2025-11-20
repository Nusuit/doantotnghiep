import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Knowledge Platform Backend is running' });
});

// API Routes
import routes from './routes';
app.use('/api', routes);

export default app;
