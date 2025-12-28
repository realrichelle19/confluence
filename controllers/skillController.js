const User = require('../models/User');
const { validationResult } = require('express-validator');
const notificationService = require('../services/notificationService');

// @desc    Add skill to user
// @route   POST /api/skills
// @access  Private
exports.addSkill = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { skill, certification, level } = req.body;
    const user = await User.findById(req.user.id);

    // Check if skill already exists
    const skillExists = user.skills.find(s => s.skill.toLowerCase() === skill.toLowerCase());
    if (skillExists) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists for this user'
      });
    }

    user.skills.push({
      skill,
      certification,
      level: level || 'intermediate',
      verified: false
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: user.skills
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user skills
// @route   GET /api/skills
// @access  Private
exports.getSkills = async (req, res, next) => {
  try {
    const userId = req.query.userId || req.user.id;

    // Only allow users to view their own skills, or coordinators
    if (userId !== req.user.id && req.user.role !== 'coordinator') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these skills'
      });
    }

    const user = await User.findById(userId).select('skills name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.skills
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:skillId
// @access  Private
exports.updateSkill = async (req, res, next) => {
  try {
    const { skill, certification, level } = req.body;
    const user = await User.findById(req.user.id);

    const skillIndex = user.skills.findIndex(s => s._id.toString() === req.params.skillId);
    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    if (skill) user.skills[skillIndex].skill = skill;
    if (certification !== undefined) user.skills[skillIndex].certification = certification;
    if (level) user.skills[skillIndex].level = level;

    await user.save();

    res.status(200).json({
      success: true,
      data: user.skills[skillIndex]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:skillId
// @access  Private
exports.deleteSkill = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    user.skills = user.skills.filter(s => s._id.toString() !== req.params.skillId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify skill
// @route   PUT /api/skills/:skillId/verify
// @access  Private/Coordinator
exports.verifySkill = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skillIndex = user.skills.findIndex(s => s._id.toString() === req.params.skillId);
    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    user.skills[skillIndex].verified = true;
    user.skills[skillIndex].verificationDate = new Date();
    user.skills[skillIndex].verifiedBy = req.user.id;

    await user.save();

    // Notify user about skill verification
    notificationService.notifySkillVerified(userId, user.skills[skillIndex]);

    res.status(200).json({
      success: true,
      data: user.skills[skillIndex]
    });
  } catch (error) {
    next(error);
  }
};

