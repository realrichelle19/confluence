# Setup Guide - Flood Emergency Platform

Complete setup instructions for running the full-stack application.

## Prerequisites

- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **MongoDB** - Local installation or MongoDB Atlas account
- **Git** (optional, for cloning)

## Step 1: Clone or Download

If using Git:
```bash
git clone <repository-url>
cd confluence
```

Or download and extract the project files.

## Step 2: Backend Setup

1. **Install backend dependencies**
   ```bash
   npm install
   ```

2. **Set up MongoDB**
   
   Option A - Local MongoDB:
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   ```
   
   Option B - MongoDB Atlas (Cloud):
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string

3. **Create backend `.env` file**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/flood-emergency-platform
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/flood-emergency-platform
   
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
   JWT_EXPIRE=7d
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Start backend server**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   MongoDB Connected: localhost:27017
   Server running in development mode on port 5000
   ```

## Step 3: Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Create frontend `.env` file**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start frontend server**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:3000/
   ```

## Step 4: Access the Application

1. Open browser to `http://localhost:3000`
2. Register a new account or login
3. Start using the platform!

## First User Setup

### Create a Coordinator Account

1. Register with role "coordinator"
2. This account can verify skills and incidents
3. Can create assignments and view reports

### Create Volunteer Accounts

1. Register with role "volunteer"
2. Add skills (swimming, first-aid, etc.)
3. Wait for coordinator to verify skills
4. Accept assignment requests

### Create Citizen Account

1. Register with role "citizen"
2. Report incidents
3. Add skills if you want to help

## Testing the Platform

### Test Incident Reporting

1. Login as any user
2. Go to "Incidents" page
3. Click "Report Incident"
4. Fill in details and set location
5. Submit

### Test 3D Map

1. Go to "3D Map" page
2. You should see incident markers
3. Use mouse to rotate, zoom, pan
4. Click markers to see details

### Test Real-Time Notifications

1. Open two browser windows
2. Login as coordinator in one, volunteer in other
3. Create an assignment (coordinator)
4. Volunteer should receive notification

### Test Skill Verification

1. Login as volunteer
2. Add a skill
3. Login as coordinator
4. Go to Skills page
5. Verify the skill
6. Volunteer receives notification

## Troubleshooting

### Backend won't start

- Check MongoDB is running: `docker ps` or check MongoDB service
- Verify `.env` file exists and has correct values
- Check port 5000 is not in use: `lsof -i :5000`

### Frontend won't start

- Check Node.js version: `node --version` (should be v16+)
- Delete `node_modules` and `package-lock.json`, then `npm install` again
- Check port 3000 is not in use

### MongoDB connection error

- Verify MongoDB is running
- Check connection string in `.env`
- For MongoDB Atlas, ensure IP is whitelisted
- Check network connectivity

### Socket.io connection issues

- Verify backend is running
- Check `VITE_SOCKET_URL` in frontend `.env`
- Check browser console for errors
- Verify JWT token is valid

### 3D Map not showing

- Check browser console for errors
- Verify WebGL is enabled in browser
- Try different browser (Chrome recommended)
- Check incidents have valid coordinates

## Production Deployment

### Backend

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure proper CORS origins
4. Use MongoDB Atlas or managed MongoDB
5. Set up SSL/TLS
6. Use process manager (PM2)

### Frontend

1. Build: `npm run build`
2. Serve `dist` folder with web server (Nginx, Apache)
3. Configure API URL for production
4. Enable HTTPS
5. Set up CDN for assets

## Environment Variables Reference

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_EXPIRE` - Token expiration (default: 7d)
- `NODE_ENV` - Environment (development/production)
- `CLIENT_URL` - Frontend URL for CORS

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.io server URL

## Next Steps

- Read [README.md](./README.md) for feature overview
- Check [API_EXAMPLES.md](./API_EXAMPLES.md) for API usage
- Review backend and frontend README files for details

## Support

For issues:
1. Check this setup guide
2. Review error messages in console
3. Check MongoDB and Node.js versions
4. Verify all environment variables are set
5. Open an issue with error details

