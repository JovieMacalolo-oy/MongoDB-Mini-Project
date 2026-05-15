const Sidequest = require('../models/Sidequest');

// GET all sidequests
const getSidequests = async (req, res) => {
    try {
        const sidequests = await Sidequest.find().sort({ createdAt: -1 });
        res.json(sidequests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET stats (Benchmarked to match Academic/Extra)
const getSidequestStats = async (req, res) => {
    try {
        const totalXP = await Sidequest.aggregate([
            { $match: { status: 'Done' } },
            { $group: { _id: null, total: { $sum: "$points" } } }
        ]);

        const statusOverview = await Sidequest.aggregate([
            { $group: { _id: "$status", total: { $sum: 1 } } }
        ]);

        const categoryStats = await Sidequest.aggregate([
            { $match: { status: 'Done' } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        res.json({
            totalXP: totalXP[0]?.total || 0,
            statusOverview: statusOverview, 
            avgPoints: categoryStats        
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST a new sidequest
const createSidequest = async (req, res) => {
    try {
        const { title, category, difficulty } = req.body;
        const diffNum = parseInt(difficulty) || 1;

        const newSidequest = new Sidequest({
            title,
            category,
            difficulty: diffNum,
            points: diffNum * 10,
            status: 'To Do'
        });

        const savedSidequest = await newSidequest.save();
        res.status(201).json(savedSidequest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PUT (Update)
const updateSidequest = async (req, res) => {
    try {
        if (req.body.difficulty) {
            req.body.points = parseInt(req.body.difficulty) * 10;
        }
        const updated = await Sidequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE
const deleteSidequest = async (req, res) => {
    try {
        await Sidequest.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const searchSidequests = async (req, res) => {
    try {
        const { query } = req.query;
        const tasks = await Sidequest.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },    // Matches title
                { category: { $regex: query, $options: 'i' } }  // Matches category
            ]
        }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. Backup Sidequest tasks (JSON Download)
const backupSidequests = async (req, res) => {
    try {
        const tasks = await Sidequest.find();

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=sidequests_backup.json');

        res.send(JSON.stringify(tasks, null, 2));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSidequests,    // Added the 's' to match the function name
    getSidequestStats,
    createSidequest,
    updateSidequest,
    deleteSidequest,
    searchSidequests,
    backupSidequests
};