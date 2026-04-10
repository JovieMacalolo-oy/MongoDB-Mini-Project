const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');

router.get('/', academicController.getAllAcademics);
router.post('/', academicController.createAcademic);
router.put('/:id', academicController.updateAcademic);
router.delete('/:id', academicController.deleteAcademic);
router.get('/stats', academicController.getAcademicStats); // <-- Check this name!

module.exports = router;
