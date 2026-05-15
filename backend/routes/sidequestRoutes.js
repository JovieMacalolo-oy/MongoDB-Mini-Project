const express = require('express');
const router = express.Router();
const sidequestController = require('../controllers/sidequestController');

// 1. Static & Special Routes (Always first)
router.get('/stats', sidequestController.getSidequestStats);
router.get('/search', sidequestController.searchSidequests); // New Search Route
router.get('/backup', sidequestController.backupSidequests); // New Backup Route

// 2. Standard Fetch & Create
router.get('/', sidequestController.getSidequests); 
router.post('/', sidequestController.createSidequest);

// 3. Parameterized Routes (Always last)
router.put('/:id', sidequestController.updateSidequest);
router.delete('/:id', sidequestController.deleteSidequest);

module.exports = router;