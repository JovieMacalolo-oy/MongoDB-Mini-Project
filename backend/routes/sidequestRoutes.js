const express = require('express');
const router = express.Router();
const sidequestController = require('../controllers/sidequestController');

// Stats must come BEFORE /:id routes to avoid being treated as an ID
router.get('/stats', sidequestController.getSidequestStats);

// Changed from getAllSidequests to getSidequests to match controller
router.get('/', sidequestController.getSidequests); 
router.post('/', sidequestController.createSidequest);
router.put('/:id', sidequestController.updateSidequest);
router.delete('/:id', sidequestController.deleteSidequest);

module.exports = router;