const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import Routes
const academicRoutes = require('./routes/academicRoutes');
const sidequestRoutes = require('./routes/sidequestRoutes');
const extracurricularRoutes = require('./routes/extracurricularRoutes'); // Added this!

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes - Pluralized to match your frontend fetch calls
app.use('/api/academics', academicRoutes);
app.use('/api/sidequests', sidequestRoutes);
app.use('/api/extracurriculars', extracurricularRoutes);

app.get('/', (req, res) => {
    res.json({ message: '🚀 Student Tracker API is Live' });
});

// Port 5001 to match your frontend configuration
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server is flying at http://localhost:${PORT}`);
});