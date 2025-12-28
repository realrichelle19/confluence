const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an incident title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide an incident description'],
    trim: true
  },
  type: {
    type: String,
    enum: ['flood', 'rescue', 'medical', 'evacuation', 'supply', 'infrastructure', 'other'],
    required: true,
    default: 'flood'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['reported', 'verified', 'in-progress', 'assigned', 'resolved', 'closed'],
    default: 'reported'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: 'Coordinates must be [longitude, latitude]'
      }
    },
    address: {
      type: String,
      trim: true
    },
    area: {
      type: String,
      trim: true
    }
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  requiredSkills: [{
    skill: {
      type: String,
      required: true,
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    minLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    }
  }],
  peopleAffected: {
    type: Number,
    default: 0,
    min: 0
  },
  urgencyLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  escalationLevel: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  assignedVolunteers: [{
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending'
    }
  }],
  resolvedAt: Date,
  closedAt: Date,
  notes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create 2dsphere index for location-based queries
incidentSchema.index({ location: '2dsphere' });

// Index for status and type queries
incidentSchema.index({ status: 1, type: 1, severity: 1 });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ reportedBy: 1 });

// Method to escalate incident
incidentSchema.methods.escalate = function() {
  if (this.escalationLevel < 5) {
    this.escalationLevel += 1;
    this.urgencyLevel = Math.min(this.urgencyLevel + 2, 10);
    if (this.severity === 'medium' && this.escalationLevel >= 2) {
      this.severity = 'high';
    } else if (this.severity === 'high' && this.escalationLevel >= 3) {
      this.severity = 'critical';
    }
  }
  return this.save();
};

// Method to find nearby volunteers (used in service layer)
incidentSchema.methods.getNearbyVolunteers = async function(maxDistance = 10000) {
  const User = mongoose.model('User');
  return await User.find({
    role: 'volunteer',
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: this.location.coordinates
        },
        $maxDistance: maxDistance // in meters
      }
    }
  });
};

module.exports = mongoose.model('Incident', incidentSchema);

