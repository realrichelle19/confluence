const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return next(new Error('Authentication error: User not found or inactive'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId} (${socket.userRole})`);

  // Join user-specific room
  socket.join(`user:${socket.userId}`);

  // Join role-based room
  socket.join(`role:${socket.userRole}`);

  // Join location-based room (if user has location)
  if (socket.user.location && socket.user.location.coordinates) {
    const [lon, lat] = socket.user.location.coordinates;
    // Join a general location room (could be more granular)
    socket.join('location:all');
  }

  // Handle location updates
  socket.on('update-location', async (data) => {
    try {
      const user = await User.findById(socket.userId);
      if (user && data.coordinates) {
        user.location = {
          type: 'Point',
          coordinates: data.coordinates,
          address: data.address || user.location.address
        };
        await user.save();
        socket.user.location = user.location;
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to update location' });
    }
  });

  // Handle typing/activity indicators
  socket.on('activity', (data) => {
    socket.broadcast.to(`user:${socket.userId}`).emit('user-activity', {
      userId: socket.userId,
      activity: data
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/assignments', require('./routes/assignments'));

// Error handler (must be last)
app.use(errorHandler);

// Socket.io notification helper
const emitNotification = (userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

const emitToRole = (role, event, data) => {
  io.to(`role:${role}`).emit(event, data);
};

const emitToAll = (event, data) => {
  io.emit(event, data);
};

// Export notification functions
app.set('emitNotification', emitNotification);
app.set('emitToRole', emitToRole);
app.set('emitToAll', emitToAll);

// Initialize notification service
const notificationService = require('./services/notificationService');
notificationService.initialize(io, emitNotification, emitToRole, emitToAll);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = { app, io, emitNotification, emitToRole, emitToAll };

