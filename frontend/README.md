# Flood Emergency Platform - Frontend

A modern 3D real-time web application built with React, Three.js, and Socket.io for matching verified citizen skills with emergency situations during floods.

## Features

- **3D Real-Time Visualization**: Interactive 3D map showing incidents and volunteers using Three.js
- **Rich UI/UX**: Modern Material-UI design with dark theme
- **Real-Time Updates**: Socket.io integration for live notifications
- **Skill Verification**: Manage and verify citizen skills
- **Location-Based Matching**: Real-time matching of volunteers to incidents
- **Emergency Escalation**: Workflow for escalating critical incidents
- **Activity Tracking**: Comprehensive reporting and analytics dashboard
- **Role-Based Dashboards**: Different views for citizens, volunteers, and coordinators

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Three.js + React Three Fiber** - 3D graphics
- **Material-UI (MUI)** - Component library
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Routing
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Layout.jsx     # Main layout with navigation
│   │   ├── Map3D.jsx      # 3D map component
│   │   └── PrivateRoute.jsx
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.jsx
│   │   └── SocketContext.jsx
│   ├── pages/             # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Map3D.jsx
│   │   ├── Skills.jsx
│   │   ├── Incidents.jsx
│   │   ├── Assignments.jsx
│   │   ├── Reports.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── services/          # API services
│   │   └── api.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Key Features Implementation

### 3D Map Visualization

The 3D map uses React Three Fiber to render:
- **Incident markers**: Color-coded spheres based on severity
- **Volunteer markers**: Blue spheres showing volunteer locations
- **Interactive controls**: Orbit controls for navigation
- **Real-time updates**: Updates when new incidents are reported

### Real-Time Notifications

Socket.io integration provides:
- New incident alerts for nearby volunteers
- Assignment request notifications
- Status change updates
- Skill verification alerts

### Role-Based Access

- **Citizen**: Report incidents, manage skills
- **Volunteer**: Accept assignments, update status, manage skills
- **Coordinator**: Full access including verification, escalation, reports

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)
- `VITE_SOCKET_URL` - Socket.io server URL (default: http://localhost:5000)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- The 3D map uses simplified coordinate projection. For production, implement proper map projection (e.g., Web Mercator)
- Location services require HTTPS in production (except localhost)
- Socket.io connection requires valid JWT token

