const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  addSkill,
  getSkills,
  updateSkill,
  deleteSkill,
  verifySkill
} = require('../controllers/skillController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const skillValidation = [
  body('skill').trim().notEmpty().withMessage('Skill name is required')
];

router.use(protect);

router.post('/', skillValidation, addSkill);
router.get('/', getSkills);
router.put('/:skillId', updateSkill);
router.delete('/:skillId', deleteSkill);
router.put('/:skillId/verify', authorize('coordinator'), verifySkill);

module.exports = router;

