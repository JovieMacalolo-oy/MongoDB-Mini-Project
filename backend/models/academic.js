const mongoose = require('mongoose');

const academicSchema = new mongoose.Schema({
    subject: { 
        type: String, 
        required: true 
    },
    activityName: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ['To Do', 'Done'], 
        default: 'To Do' 
    },
    deadline: { 
        type: Date 
    },
    notes: { 
        type: String 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Academic', academicSchema);