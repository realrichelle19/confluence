const User = require('../models/User');
const Assignment = require('../models/Assignment');
const { validationResult } = require('express-validator');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Coordinator
exports.getUsers = async (req, res, next) => {
  try {
    const { role, isActive, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    // Only allow users to update themselves, or coordinators to update anyone
    if (req.user.id !== req.params.id && req.user.role !== 'coordinator') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, phone, location, isActive } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) {
      user.location = {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address
      };
    }
    if (isActive !== undefined && req.user.role === 'coordinator') {
      user.isActive = isActive;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Only allow users to view their own stats, or coordinators
    if (req.user.id !== userId && req.user.role !== 'coordinator') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these statistics'
      });
    }

    const assignments = await Assignment.find({ volunteer: userId });
    
    const stats = {
      totalAssignments: assignments.length,
      completed: assignments.filter(a => a.status === 'completed').length,
      inProgress: assignments.filter(a => a.status === 'in-progress').length,
      pending: assignments.filter(a => a.status === 'pending').length,
      averageRating: assignments
        .filter(a => a.rating)
        .reduce((sum, a) => sum + a.rating, 0) / 
        assignments.filter(a => a.rating).length || 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

