const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const Event = require('./models/Event');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
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
    res.send('Unauthorized');
};

// ... [previous code]

// Serve public event page
app.get('/', async (req, res) => {
    const events = await Event.find();
    res.sendFile(__dirname + '/views/index.html');
});

// Admin panel
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/views/admin.html');
});

// Fetch events for public view
app.get('/events', async (req, res) => {
    const events = await Event.find();
    res.json(events);
});

// Handle admin login and event submission
app.post('/admin', auth, upload.single('image'), (req, res) => {
    const newEvent = new Event({
        title: req.body.title,
        description: req.body.description,
        image: req.file ? '/uploads/' + req.file.filename : null,
        link: req.body.link,
    });
    newEvent.save();
    res.redirect('/');
});
}
