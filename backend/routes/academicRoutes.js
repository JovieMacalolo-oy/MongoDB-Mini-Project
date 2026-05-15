const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');

// Standard CRUD
router.get('/', academicController.getAllAcademics);
router.post('/', academicController.createAcademic);

// Specific Features (Place these BEFORE /:id)
router.get('/search', academicController.searchAcademics);
router.get('/backup', academicController.backupAcademics);
router.get('/stats', academicController.getAcademicStats);

// Parameterized Routes
router.put('/:id', academicController.updateAcademic);
router.delete('/:id', academicController.deleteAcademic);

module.exports = router;