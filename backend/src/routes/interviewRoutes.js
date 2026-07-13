const express = require('express');
const router = express.Router();
const {
  startInterview,
  sendMessage,
  endInterview,
  getInterviews,
  getInterviewById,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.use(protect); // Protect all routes in this router

router.post('/start', startInterview);
router.post('/:id/message', sendMessage);
router.post('/:id/end', endInterview);
router.get('/', getInterviews);
router.get('/:id', getInterviewById);

module.exports = router;
