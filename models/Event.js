// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    link: String,
});

module.exports = mongoose.model('Event', eventSchema);
