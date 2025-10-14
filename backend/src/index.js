const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/docmedaa_dummy';

app.use(cors());
app.use(bodyParser.json());

// Only connect to DB if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB(MONGO_URI).catch(err => {
    console.error('Failed to connect DB:', err);
    process.exit(1);
  });
}

// mount routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('DocMedaa API running'));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app; // exported for tests
