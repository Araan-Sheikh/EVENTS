const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const Event = require('./models/Event');
require('dotenv').config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage: storage });

// Simple auth middleware
const auth = (req, res, next) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        return next();
    }
    console.log('Unauthorized access attempt with username:', username);
    res.status(401).send('Unauthorized');
};

// Serve index.html
app.get('/', async (req, res) => {
    try {
        const events = await Event.find();
        res.sendFile(__dirname + '/views/index.html'); // Serve index.html from the views directory
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Serve admin.html for the admin page
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/views/admin.html'); // Serve admin.html from the views directory
});

// Handle form submission for creating new events
app.post('/admin', auth, upload.single('image'), async (req, res) => {
    try {
        const newEvent = new Event({
            title: req.body.title,
            description: req.body.description,
            image: req.file ? '/uploads/' + req.file.filename : null,
            link: req.body.link,
        });
        await newEvent.save();
        res.redirect('/');
    } catch (error) {
        console.error('Error saving new event:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
