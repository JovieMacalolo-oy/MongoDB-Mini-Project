const express = require('express');
const router = express.Router();
const extraController = require('../controllers/extracurricularController');

// 1. Static/Specific Routes (Place these first)
router.get('/', extraController.getAllExtras);
router.get('/stats', extraController.getExtraStats);
router.get('/search', extraController.searchExtras); // New Search Route
router.get('/backup', extraController.backupExtras); // New Backup Route

// 2. Action Routes
router.post('/', extraController.createExtra);

// 3. Parameterized Routes (Place these last)
router.put('/:id', extraController.updateExtra);
router.delete('/:id', extraController.deleteExtra);

module.exports = router;