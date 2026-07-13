const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  analyzeResume,
  generateCoverLetter,
  generateLinkedInSummary,
  generateBio,
  generateEmail,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Multer memory configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit to 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF format is supported for resume uploads.'));
    }
  }
});

router.use(protect); // Protect all AI routes

// Resume PDF upload & analyze route
router.post('/analyze-resume', upload.single('resume'), analyzeResume);

// Text-generation tools routes
router.post('/cover-letter', generateCoverLetter);
router.post('/linkedin-summary', generateLinkedInSummary);
router.post('/bio', generateBio);
router.post('/email', generateEmail);

module.exports = router;
