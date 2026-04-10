const Extracurricular = require('../models/extracurricular');

// 1. Get all Extracurricular tasks
const getAllExtras = async (req, res) => {
    try {
        const tasks = await Extracurricular.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Create Extracurricular task
const createExtra = async (req, res) => {
    try {
        const newTask = new Extracurricular({
            ...req.body,
            status: "To Do"
        });
        const saved = await newTask.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 3. Update Extracurricular (Handles Edit & Checkmark)
const updateExtra = async (req, res) => {
    try {
        const updated = await Extracurricular.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 4. Delete Extracurricular
const deleteExtra = async (req, res) => {
    try {
        await Extracurricular.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Get Extracurricular Stats
const getExtraStats = async (req, res) => {
    try {
        const stats = await Extracurricular.aggregate([
            {
                $facet: {
                    // Counts how many are 'To Do' vs 'Done'
                    "statusOverview": [
                        { $group: { _id: "$status", total: { $sum: 1 } } }
                    ],
                    // Total unique organizations
                    "orgCount": [
                        { $group: { _id: "$organization" } },
                        { $count: "total" }
                    ],
                    // Breakdown by Organization
                    "orgStats": [
                        { $group: { _id: "$organization", count: { $sum: 1 } } }
                    ]
                }
            }
        ]);

        res.json({
            statusOverview: stats[0].statusOverview,
            activeOrgs: stats[0].orgCount[0]?.total || 0,
            totalTasks: stats[0].statusOverview.reduce((acc, curr) => acc + curr.total, 0),
            orgStats: stats[0].orgStats
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllExtras,
    createExtra,
    updateExtra,
    deleteExtra,
    getExtraStats
};