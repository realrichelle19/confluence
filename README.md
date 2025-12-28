# Flood Emergency Platform - Full Stack Application

A comprehensive 3D real-time platform for matching verified citizen skills with emergency situations during floods. Built with Node.js/Express backend and React/Three.js frontend.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/flood-emergency-platform
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

3. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   
   # Or use MongoDB Atlas (cloud)
   ```

4. **Start backend server**
   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start frontend server**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
.
├── backend/                 # Node.js/Express backend
│   ├── config/              # Database configuration
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Auth & error handling
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   └── server.js            # Main server file
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/         # React contexts
│   │   ├── pages/            # Page components
│   │   └── services/         # API services
│   └── package.json
├── package.json
└── README.md
```

## ✨ Key Features

### Backend Features
- ✅ RESTful API with Express.js
- ✅ JWT authentication & role-based access control
- ✅ MongoDB with Mongoose ODM
- ✅ 2dsphere geo-indexes for location queries
- ✅ Socket.io for real-time notifications
- ✅ Skill verification system
- ✅ Location-based volunteer matching
- ✅ Emergency escalation workflows
- ✅ Activity tracking and reporting

### Frontend Features
- ✅ 3D real-time visualization with Three.js
- ✅ Modern Material-UI design
- ✅ Real-time notifications via Socket.io
- ✅ Interactive 3D map showing incidents and volunteers
- ✅ Skill management interface
- ✅ Incident reporting and management
- ✅ Assignment workflow
- ✅ Analytics dashboard with charts

## 🎯 User Roles

### Citizen
- Report incidents
- Manage personal skills
- View nearby incidents

### Volunteer
- All citizen features
- Accept/reject assignments
- Update assignment status
- View matched incidents

### Coordinator
- All volunteer features
- Verify skills and incidents
- Create assignments
- Escalate incidents
- View comprehensive reports

## 🔌 API Endpoints

See [API_EXAMPLES.md](./API_EXAMPLES.md) for detailed API usage examples.

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Incidents
- `POST /api/incidents` - Create incident
- `GET /api/incidents` - Get all incidents
- `GET /api/incidents/:id/match-volunteers` - Match volunteers

### Assignments
- `POST /api/assignments` - Create assignment (coordinator)
- `PUT /api/assignments/:id/accept` - Accept assignment
- `PUT /api/assignments/:id/complete` - Complete assignment

## 🗺️ 3D Map Features

The 3D map visualization includes:
- **Incident markers**: Color-coded by severity (red=critical, orange=high, yellow=medium, green=low)
- **Volunteer markers**: Blue spheres showing volunteer locations
- **Interactive navigation**: Orbit controls for pan, zoom, rotate
- **Real-time updates**: Live updates when new incidents are reported
- **Info panels**: Click markers to view details

## 🔔 Real-Time Notifications

Socket.io events:
- `new-incident-nearby` - New incident near volunteer
- `assignment-request` - New assignment for volunteer
- `assignment-accepted` - Volunteer accepted assignment
- `incident-escalated` - Incident escalated
- `skill-verified` - Skill verified by coordinator

## 🛠️ Development

### Backend Development
```bash
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

## 📦 Production Build

### Backend
```bash
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## 🔒 Security Notes

- Change `JWT_SECRET` to a strong random value in production
- Use HTTPS in production
- Configure CORS properly for production domains
- Use environment variables for sensitive data
- Implement rate limiting for production

## 📝 Database Collections

### Users
- User profiles with roles
- Location (GeoJSON Point)
- Skills array with verification

### Incidents
- Emergency reports
- Location (GeoJSON Point)
- Required skills
- Status workflow

### Assignments
- Volunteer-to-incident assignments
- Status tracking
- Distance calculations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC

## 🆘 Support

For issues and questions:
- Check the documentation in `/backend/README.md` and `/frontend/README.md`
- Review API examples in `API_EXAMPLES.md`
- Open an issue in the repository

---

Built with ❤️ for emergency response and community safety
