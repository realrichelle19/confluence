const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createIncident,
  getIncidents,
  getIncident,
  updateIncident,
  verifyIncident,
  escalateIncident,
  matchVolunteers,
  addNote
} = require('../controllers/incidentController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const incidentValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').isIn(['flood', 'rescue', 'medical', 'evacuation', 'supply', 'infrastructure', 'other']).withMessage('Invalid incident type'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('location.coordinates.*').isFloat().withMessage('Coordinates must be numbers')
];

router.use(protect);

router.post('/', incidentValidation, createIncident);
router.get('/', getIncidents);
router.get('/:id', getIncident);
router.put('/:id', updateIncident);
router.put('/:id/verify', authorize('coordinator'), verifyIncident);
router.put('/:id/escalate', authorize('coordinator'), escalateIncident);
router.get('/:id/match-volunteers', matchVolunteers);
router.post('/:id/notes', [body('note').trim().notEmpty().withMessage('Note is required')], addNote);

module.exports = router;

