const Incident = require('../models/Incident');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const { validationResult } = require('express-validator');
const notificationService = require('../services/notificationService');

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// @desc    Create incident
// @route   POST /api/incidents
// @access  Private
exports.createIncident = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, description, type, severity, location, requiredSkills, peopleAffected, urgencyLevel } = req.body;

    const incident = await Incident.create({
      title,
      description,
      type,
      severity,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address,
        area: location.area
      },
      requiredSkills: requiredSkills || [],
      peopleAffected: peopleAffected || 0,
      urgencyLevel: urgencyLevel || 5,
      reportedBy: req.user.id
    });

    // Notify nearby volunteers about new incident
    const nearbyVolunteers = await User.find({
      role: 'volunteer',
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: incident.location.coordinates
          },
          $maxDistance: 10000 // 10km
        }
      }
    }).select('_id');

    nearbyVolunteers.forEach(volunteer => {
      notificationService.notifyNewIncidentNearby(volunteer._id, incident);
    });

    res.status(201).json({
      success: true,
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all incidents
// @route   GET /api/incidents
// @access  Private
exports.getIncidents = async (req, res, next) => {
  try {
    const { status, type, severity, near, maxDistance = 10000 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (severity) query.severity = severity;

    // Location-based query
    if (near) {
      const [longitude, latitude] = near.split(',').map(Number);
      if (!isNaN(longitude) && !isNaN(latitude)) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: parseInt(maxDistance)
          }
        };
      }
    }

    const incidents = await Incident.find(query)
      .populate('reportedBy', 'name email phone')
      .populate('verifiedBy', 'name email')
      .populate('assignedVolunteers.volunteer', 'name email phone location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single incident
// @route   GET /api/incidents/:id
// @access  Private
exports.getIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email phone')
      .populate('verifiedBy', 'name email')
      .populate('assignedVolunteers.volunteer', 'name email phone location skills');

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update incident
// @route   PUT /api/incidents/:id
// @access  Private
exports.updateIncident = async (req, res, next) => {
  try {
    let incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    // Only reporter, coordinator, or assigned volunteers can update
    const canUpdate = 
      incident.reportedBy.toString() === req.user.id ||
      req.user.role === 'coordinator' ||
      incident.assignedVolunteers.some(
        av => av.volunteer.toString() === req.user.id && av.status === 'accepted'
      );

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this incident'
      });
    }

    const { title, description, status, severity, location, requiredSkills, peopleAffected, urgencyLevel } = req.body;

    if (title) incident.title = title;
    if (description) incident.description = description;
    if (status && (req.user.role === 'coordinator' || req.user.role === 'volunteer')) {
      const oldStatus = incident.status;
      incident.status = status;
      if (status === 'resolved') incident.resolvedAt = new Date();
      if (status === 'closed') incident.closedAt = new Date();
      
      if (oldStatus !== status) {
        notificationService.notifyIncidentStatusChange(incident, oldStatus);
      }
    }
    if (severity && req.user.role === 'coordinator') incident.severity = severity;
    if (location) {
      incident.location = {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address,
        area: location.area
      };
    }
    if (requiredSkills) incident.requiredSkills = requiredSkills;
    if (peopleAffected !== undefined) incident.peopleAffected = peopleAffected;
    if (urgencyLevel !== undefined && req.user.role === 'coordinator') {
      incident.urgencyLevel = urgencyLevel;
    }

    await incident.save();

    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify incident
// @route   PUT /api/incidents/:id/verify
// @access  Private/Coordinator
exports.verifyIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    incident.status = 'verified';
    incident.verifiedBy = req.user.id;
    incident.verifiedAt = new Date();

    await incident.save();

    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Escalate incident
// @route   PUT /api/incidents/:id/escalate
// @access  Private/Coordinator
exports.escalateIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    const oldEscalationLevel = incident.escalationLevel;
    await incident.escalate();

    if (incident.escalationLevel > oldEscalationLevel) {
      notificationService.notifyIncidentEscalated(incident);
    }

    res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Find matching volunteers for incident
// @route   GET /api/incidents/:id/match-volunteers
// @access  Private
exports.matchVolunteers = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    const maxDistance = parseInt(req.query.maxDistance) || 10000; // 10km default

    // Find nearby volunteers
    const nearbyVolunteers = await User.find({
      role: 'volunteer',
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: incident.location.coordinates
          },
          $maxDistance: maxDistance
        }
      }
    }).select('name email phone location skills');

    // Match volunteers with required skills
    const matchedVolunteers = nearbyVolunteers.map(volunteer => {
      const matchedSkills = [];
      let matchScore = 0;

      incident.requiredSkills.forEach(requiredSkill => {
        const volunteerSkill = volunteer.skills.find(
          vs => vs.skill.toLowerCase() === requiredSkill.skill.toLowerCase() && vs.verified
        );

        if (volunteerSkill) {
          matchedSkills.push({
            skill: volunteerSkill.skill,
            level: volunteerSkill.level,
            requiredLevel: requiredSkill.minLevel,
            priority: requiredSkill.priority
          });

          // Calculate match score
          const levelValues = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
          const requiredLevel = levelValues[requiredSkill.minLevel] || 2;
          const volunteerLevel = levelValues[volunteerSkill.level] || 2;

          if (volunteerLevel >= requiredLevel) {
            matchScore += requiredSkill.priority === 'high' ? 3 : requiredSkill.priority === 'medium' ? 2 : 1;
          }
        }
      });

      const distance = calculateDistance(
        incident.location.coordinates[1],
        incident.location.coordinates[0],
        volunteer.location.coordinates[1],
        volunteer.location.coordinates[0]
      );

      return {
        volunteer: {
          id: volunteer._id,
          name: volunteer.name,
          email: volunteer.email,
          phone: volunteer.phone,
          location: volunteer.location
        },
        matchedSkills,
        matchScore,
        distance: Math.round(distance)
      };
    }).filter(match => match.matchedSkills.length > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      count: matchedVolunteers.length,
      data: matchedVolunteers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add note to incident
// @route   POST /api/incidents/:id/notes
// @access  Private
exports.addNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    incident.notes.push({
      note,
      addedBy: req.user.id
    });

    await incident.save();

    res.status(201).json({
      success: true,
      data: incident.notes
    });
  } catch (error) {
    next(error);
  }
};

