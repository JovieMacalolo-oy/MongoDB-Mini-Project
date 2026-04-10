const mongoose = require('mongoose');

const sidequestSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        enum: ['wellness', 'exploration', 'social'], 
        required: true 
    },
    difficulty: { 
        type: Number, 
        min: 1, 
        max: 5, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['To Do', 'Done'], 
        default: 'To Do' 
    },
    points: { 
        type: Number 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Sidequest', sidequestSchema);