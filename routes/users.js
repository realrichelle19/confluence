const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  getUserStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('coordinator'), getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.get('/:id/stats', getUserStats);

module.exports = router;

