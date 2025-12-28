const Assignment = require('../models/Assignment');
const Incident = require('../models/Incident');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const notificationService = require('../services/notificationService');

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private/Coordinator
exports.createAssignment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { incidentId, volunteerId, priority, estimatedDuration } = req.body;

    const incident = await Incident.findById(incidentId);
    const volunteer = await User.findById(volunteerId);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await Assignment.findOne({
      incident: incidentId,
      volunteer: volunteerId
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Assignment already exists'
      });
    }

    // Calculate distance
    const distance = calculateDistance(
      incident.location.coordinates[1],
      incident.location.coordinates[0],
      volunteer.location.coordinates[1],
      volunteer.location.coordinates[0]
    );

    // Find matched skills
    const matchedSkills = [];
    incident.requiredSkills.forEach(requiredSkill => {
      const volunteerSkill = volunteer.skills.find(
        vs => vs.skill.toLowerCase() === requiredSkill.skill.toLowerCase() && vs.verified
      );
      if (volunteerSkill) {
        matchedSkills.push({
          skill: volunteerSkill.skill,
          level: volunteerSkill.level
        });
      }
    });

    const assignment = await Assignment.create({
      incident: incidentId,
      volunteer: volunteerId,
      coordinator: req.user.id,
      distance: Math.round(distance),
      matchedSkills,
      priority: priority || 'medium',
      estimatedDuration,
      status: 'pending'
    });

    // Add to incident's assigned volunteers
    incident.assignedVolunteers.push({
      volunteer: volunteerId,
      status: 'pending'
    });
    await incident.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('incident', 'title description type severity location')
      .populate('volunteer', 'name email phone location')
      .populate('coordinator', 'name email');

    // Notify volunteer about assignment request
    notificationService.notifyAssignmentRequest(volunteerId, populatedAssignment);

    res.status(201).json({
      success: true,
      data: populatedAssignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res, next) => {
  try {
    const { status, volunteerId, incidentId } = req.query;
    const query = {};

    // Volunteers can only see their own assignments
    if (req.user.role === 'volunteer') {
      query.volunteer = req.user.id;
    } else if (volunteerId && req.user.role === 'coordinator') {
      query.volunteer = volunteerId;
    }

    if (incidentId) query.incident = incidentId;
    if (status) query.status = status;

    const assignments = await Assignment.find(query)
      .populate('incident', 'title description type severity location status')
      .populate('volunteer', 'name email phone location')
      .populate('coordinator', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('incident')
      .populate('volunteer')
      .populate('coordinator');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'coordinator' && 
        assignment.volunteer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this assignment'
      });
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept assignment
// @route   PUT /api/assignments/:id/accept
// @access  Private/Volunteer
exports.acceptAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('incident')
      .populate('volunteer');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignment.volunteer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this assignment'
      });
    }

    if (assignment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Assignment is already ${assignment.status}`
      });
    }

    await assignment.accept();

    // Update incident
    const incident = await Incident.findById(assignment.incident._id);
    const volunteerAssignment = incident.assignedVolunteers.find(
      av => av.volunteer.toString() === assignment.volunteer._id.toString()
    );
    if (volunteerAssignment) {
      volunteerAssignment.status = 'accepted';
    }
    if (incident.status === 'reported' || incident.status === 'verified') {
      incident.status = 'assigned';
    }
    await incident.save();

    const updatedAssignment = await Assignment.findById(assignment._id)
      .populate('incident', 'title description type severity location status')
      .populate('volunteer', 'name email phone location')
      .populate('coordinator', 'name email');

    // Notify coordinator about acceptance
    if (updatedAssignment.coordinator) {
      notificationService.notifyAssignmentAccepted(updatedAssignment.coordinator._id, updatedAssignment);
    }

    res.status(200).json({
      success: true,
      data: updatedAssignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject assignment
// @route   PUT /api/assignments/:id/reject
// @access  Private/Volunteer
exports.rejectAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignment.volunteer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this assignment'
      });
    }

    if (assignment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Assignment is already ${assignment.status}`
      });
    }

    assignment.status = 'rejected';
    assignment.rejectedAt = new Date();
    await assignment.save();

    // Update incident
    const incident = await Incident.findById(assignment.incident);
    const volunteerAssignment = incident.assignedVolunteers.find(
      av => av.volunteer.toString() === assignment.volunteer.toString()
    );
    if (volunteerAssignment) {
      volunteerAssignment.status = 'rejected';
    }
    await incident.save();

    // Notify coordinator about rejection
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('coordinator', '_id');
    if (populatedAssignment.coordinator) {
      notificationService.notifyAssignmentRejected(populatedAssignment.coordinator._id, populatedAssignment);
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start assignment
// @route   PUT /api/assignments/:id/start
// @access  Private/Volunteer
exports.startAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignment.volunteer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start this assignment'
      });
    }

    if (assignment.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Assignment must be accepted before starting'
      });
    }

    await assignment.start();

    // Update incident status
    const incident = await Incident.findById(assignment.incident);
    if (incident.status === 'assigned') {
      incident.status = 'in-progress';
    }
    await incident.save();

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete assignment
// @route   PUT /api/assignments/:id/complete
// @access  Private/Volunteer
exports.completeAssignment = async (req, res, next) => {
  try {
    const { actualDuration, rating, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignment.volunteer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this assignment'
      });
    }

    if (assignment.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Assignment must be in-progress before completing'
      });
    }

    await assignment.complete(actualDuration);

    if (rating) assignment.rating = rating;
    if (feedback) assignment.feedback = feedback;
    await assignment.save();

    // Update incident
    const incident = await Incident.findById(assignment.incident);
    const volunteerAssignment = incident.assignedVolunteers.find(
      av => av.volunteer.toString() === assignment.volunteer.toString()
    );
    if (volunteerAssignment) {
      volunteerAssignment.status = 'completed';
    }

    // Check if all assignments are completed
    const allAssignments = await Assignment.find({ incident: assignment.incident });
    const allCompleted = allAssignments.every(a => 
      a.status === 'completed' || a.status === 'cancelled'
    );

    if (allCompleted && incident.status !== 'resolved') {
      incident.status = 'resolved';
      incident.resolvedAt = new Date();
    }

    await incident.save();

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add note to assignment
// @route   POST /api/assignments/:id/notes
// @access  Private
exports.addNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'coordinator' && 
        assignment.volunteer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add notes to this assignment'
      });
    }

    assignment.notes.push({
      note,
      addedBy: req.user.id
    });

    await assignment.save();

    res.status(201).json({
      success: true,
      data: assignment.notes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get volunteer activity report
// @route   GET /api/assignments/reports/volunteer-activity
// @access  Private/Coordinator
exports.getVolunteerActivityReport = async (req, res, next) => {
  try {
    const { startDate, endDate, volunteerId } = req.query;
    const query = {};

    if (volunteerId) query.volunteer = volunteerId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const assignments = await Assignment.find(query)
      .populate('volunteer', 'name email')
      .populate('incident', 'title type severity')
      .sort({ createdAt: -1 });

    // Generate report
    const report = {
      totalAssignments: assignments.length,
      byStatus: {
        pending: assignments.filter(a => a.status === 'pending').length,
        accepted: assignments.filter(a => a.status === 'accepted').length,
        inProgress: assignments.filter(a => a.status === 'in-progress').length,
        completed: assignments.filter(a => a.status === 'completed').length,
        rejected: assignments.filter(a => a.status === 'rejected').length,
        cancelled: assignments.filter(a => a.status === 'cancelled').length
      },
      byVolunteer: {},
      averageRating: assignments
        .filter(a => a.rating)
        .reduce((sum, a) => sum + a.rating, 0) / 
        assignments.filter(a => a.rating).length || 0,
      totalDistance: assignments.reduce((sum, a) => sum + (a.distance || 0), 0),
      assignments: assignments
    };

    // Group by volunteer
    assignments.forEach(assignment => {
      const volunteerId = assignment.volunteer._id.toString();
      if (!report.byVolunteer[volunteerId]) {
        report.byVolunteer[volunteerId] = {
          volunteer: assignment.volunteer,
          total: 0,
          completed: 0,
          averageRating: 0
        };
      }
      report.byVolunteer[volunteerId].total++;
      if (assignment.status === 'completed') {
        report.byVolunteer[volunteerId].completed++;
      }
    });

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

