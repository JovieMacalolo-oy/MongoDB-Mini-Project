const express = require('express');
const router = express.Router();
const extraController = require('../controllers/extracurricularController');

// Standard CRUD
router.get('/', extraController.getAllExtras);
router.post('/', extraController.createExtra);
router.put('/:id', extraController.updateExtra);
router.delete('/:id', extraController.deleteExtra);

// The Stats route - check that this function name exists!
router.get('/stats', extraController.getExtraStats);

module.exports = router;