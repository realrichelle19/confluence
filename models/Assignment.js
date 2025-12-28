const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: true
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  rejectedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  matchedSkills: [{
    skill: String,
    level: String
  }],
  distance: {
    type: Number, // in meters
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: 0
  },
  actualDuration: {
    type: Number, // in minutes
    min: 0
  },
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
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    trim: true
  },
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

// Indexes for efficient queries
assignmentSchema.index({ incident: 1, volunteer: 1 });
assignmentSchema.index({ volunteer: 1, status: 1 });
assignmentSchema.index({ status: 1, createdAt: -1 });
assignmentSchema.index({ coordinator: 1 });

// Prevent duplicate assignments
assignmentSchema.index({ incident: 1, volunteer: 1 }, { unique: true });

// Method to accept assignment
assignmentSchema.methods.accept = function() {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  return this.save();
};

// Method to start assignment
assignmentSchema.methods.start = function() {
  this.status = 'in-progress';
  this.startedAt = new Date();
  return this.save();
};

// Method to complete assignment
assignmentSchema.methods.complete = function(actualDuration) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (actualDuration) {
    this.actualDuration = actualDuration;
  }
  return this.save();
};

module.exports = mongoose.model('Assignment', assignmentSchema);

