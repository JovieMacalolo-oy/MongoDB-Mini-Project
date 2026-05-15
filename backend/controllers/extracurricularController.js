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

// 6. Search Extracurricular tasks (Live Search)
const searchExtras = async (req, res) => {
    try {
        const { query } = req.query; // This captures the letters typed in the search bar
        
        const tasks = await Extra.find({
            $or: [
                { organization: { $regex: query, $options: 'i' } }, // Matches Org name
                { taskName: { $regex: query, $options: 'i' } },     // Matches Task name
                { notes: { $regex: query, $options: 'i' } }         // Matches Notes
            ]
        }).sort({ createdAt: -1 });
        
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. Backup Extracurricular tasks (JSON Download)
const backupExtras = async (req, res) => {
    try {
        const tasks = await Extra.find();
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=extracurricular_backup.json');
        
        res.send(JSON.stringify(tasks, null, 2));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllExtras,
    createExtra,
    updateExtra,
    deleteExtra,
    getExtraStats,
    searchExtras,
    backupExtras
};