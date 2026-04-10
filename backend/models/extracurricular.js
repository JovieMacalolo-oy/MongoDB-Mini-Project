const mongoose = require('mongoose');

const extraSchema = new mongoose.Schema({
    taskName: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['To Do', 'Done'], 
        default: 'To Do' 
    },

    organization: { 
        type: String, 
        required: true 
    },
    deadline: { 
        type: Date 
    },
    notes: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ['To Do', 'Done'], 
        default: 'To Do' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Extracurricular', extraSchema);