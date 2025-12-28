// Notification service for real-time updates
// This service is used by controllers to emit Socket.io events

let io = null;
let emitNotification = null;
let emitToRole = null;
let emitToAll = null;

// Initialize notification service with Socket.io instance
const initialize = (socketIo, notificationFn, roleFn, allFn) => {
  io = socketIo;
  emitNotification = notificationFn;
  emitToRole = roleFn;
  emitToAll = allFn;
};

// Notify user about new incident near them
const notifyNewIncidentNearby = (userId, incident) => {
  if (emitNotification) {
    emitNotification(userId, 'new-incident-nearby', {
      message: 'New incident reported near your location',
      incident: {
        id: incident._id,
        title: incident.title,
        type: incident.type,
        severity: incident.severity,
        location: incident.location,
        distance: incident.distance || null
      },
      timestamp: new Date()
    });
  }
};

// Notify volunteer about assignment request
const notifyAssignmentRequest = (volunteerId, assignment) => {
  if (emitNotification) {
    emitNotification(volunteerId, 'assignment-request', {
      message: 'New assignment request for you',
      assignment: {
        id: assignment._id,
        incident: assignment.incident,
        priority: assignment.priority,
        distance: assignment.distance,
        matchedSkills: assignment.matchedSkills
      },
      timestamp: new Date()
    });
  }
};

// Notify about assignment acceptance
const notifyAssignmentAccepted = (coordinatorId, assignment) => {
  if (emitNotification) {
    emitNotification(coordinatorId, 'assignment-accepted', {
      message: 'Volunteer accepted assignment',
      assignment: {
        id: assignment._id,
        volunteer: assignment.volunteer,
        incident: assignment.incident
      },
      timestamp: new Date()
    });
  }
};

// Notify about assignment rejection
const notifyAssignmentRejected = (coordinatorId, assignment) => {
  if (emitNotification) {
    emitNotification(coordinatorId, 'assignment-rejected', {
      message: 'Volunteer rejected assignment',
      assignment: {
        id: assignment._id,
        volunteer: assignment.volunteer,
        incident: assignment.incident
      },
      timestamp: new Date()
    });
  }
};

// Notify about incident escalation
const notifyIncidentEscalated = (incident) => {
  if (emitToRole) {
    emitToRole('coordinator', 'incident-escalated', {
      message: 'Incident has been escalated',
      incident: {
        id: incident._id,
        title: incident.title,
        escalationLevel: incident.escalationLevel,
        severity: incident.severity,
        urgencyLevel: incident.urgencyLevel
      },
      timestamp: new Date()
    });
  }
};

// Notify about incident status change
const notifyIncidentStatusChange = (incident, oldStatus) => {
  if (emitToAll) {
    emitToAll('incident-status-changed', {
      message: `Incident status changed from ${oldStatus} to ${incident.status}`,
      incident: {
        id: incident._id,
        title: incident.title,
        status: incident.status,
        oldStatus
      },
      timestamp: new Date()
    });
  }
};

// Notify about new volunteer nearby
const notifyNewVolunteerNearby = (incidentId, volunteer) => {
  if (emitToAll) {
    emitToAll('volunteer-nearby', {
      message: 'New volunteer available nearby',
      incidentId,
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        skills: volunteer.skills
      },
      timestamp: new Date()
    });
  }
};

// Notify about skill verification
const notifySkillVerified = (userId, skill) => {
  if (emitNotification) {
    emitNotification(userId, 'skill-verified', {
      message: 'Your skill has been verified',
      skill: {
        name: skill.skill,
        level: skill.level
      },
      timestamp: new Date()
    });
  }
};

module.exports = {
  initialize,
  notifyNewIncidentNearby,
  notifyAssignmentRequest,
  notifyAssignmentAccepted,
  notifyAssignmentRejected,
  notifyIncidentEscalated,
  notifyIncidentStatusChange,
  notifyNewVolunteerNearby,
  notifySkillVerified
};

