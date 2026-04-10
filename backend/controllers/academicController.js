const Academic = require('../models/academic');

// 1. Get all Academic tasks
const getAllAcademics = async (req, res) => {
    try {
        const tasks = await Academic.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Create Academic task
const createAcademic = async (req, res) => {
    try {
        const newTask = new Academic({
            ...req.body,
            status: "To Do" // Ensure default status
        });
        const saved = await newTask.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 3. Update Academic (Handles Edit & Checkmark)
const updateAcademic = async (req, res) => {
    try {
        const updated = await Academic.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Task not found" });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. Delete Academic
const deleteAcademic = async (req, res) => {
    try {
        await Academic.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Get Academic Stats
const getAcademicStats = async (req, res) => {
    try {
        const stats = await Academic.aggregate([
            {
                $facet: {
                    // Counts how many are 'To Do' vs 'Done'
                    "statusOverview": [
                        { $match: { status: "Done" } }, // ADD THIS LINE: It filters the count
                        { $group: { _id: "$status", total: { $sum: 1 } } }
                    ],
                    // Breakdown by Subject
                    "subjectDist": [
                        { $group: { _id: "$subject", count: { $sum: 1 } } }
                    ]
                }
            }
        ]);
        res.json(stats[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllAcademics,
    createAcademic,
    updateAcademic,
    deleteAcademic,
    getAcademicStats
};