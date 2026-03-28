const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: [
    'https://trellos-clone.netlify.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

// Global error handler
app.use('/api', require('./src/routes'));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
