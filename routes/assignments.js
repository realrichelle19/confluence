const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createAssignment,
  getAssignments,
  getAssignment,
  acceptAssignment,
  rejectAssignment,
  startAssignment,
  completeAssignment,
  addNote,
  getVolunteerActivityReport
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const assignmentValidation = [
  body('incidentId').notEmpty().withMessage('Incident ID is required'),
  body('volunteerId').notEmpty().withMessage('Volunteer ID is required')
];

router.use(protect);

router.post('/', authorize('coordinator'), assignmentValidation, createAssignment);
router.get('/', getAssignments);
router.get('/reports/volunteer-activity', authorize('coordinator'), getVolunteerActivityReport);
router.get('/:id', getAssignment);
router.put('/:id/accept', acceptAssignment);
router.put('/:id/reject', rejectAssignment);
router.put('/:id/start', startAssignment);
router.put('/:id/complete', completeAssignment);
router.post('/:id/notes', [body('note').trim().notEmpty().withMessage('Note is required')], addNote);

module.exports = router;

