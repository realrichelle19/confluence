# API Usage Examples

## Authentication

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "volunteer",
  "location": {
    "coordinates": [-122.4194, 37.7749],
    "address": "San Francisco, CA"
  }
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response includes JWT token:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

## Skills Management

### Add Skill
```bash
POST /api/skills
Authorization: Bearer <token>
Content-Type: application/json

{
  "skill": "swimming",
  "level": "advanced",
  "certification": "Red Cross Certified"
}
```

### Verify Skill (Coordinator only)
```bash
PUT /api/skills/:skillId/verify
Authorization: Bearer <coordinator-token>
Content-Type: application/json

{
  "userId": "user-id-here"
}
```

## Incidents

### Create Incident
```bash
POST /api/incidents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Flood in Downtown Area",
  "description": "Severe flooding in downtown, multiple people trapped",
  "type": "flood",
  "severity": "high",
  "location": {
    "coordinates": [-122.4194, 37.7749],
    "address": "123 Main St, San Francisco",
    "area": "Downtown"
  },
  "requiredSkills": [
    {
      "skill": "swimming",
      "priority": "high",
      "minLevel": "intermediate"
    },
    {
      "skill": "first-aid",
      "priority": "medium",
      "minLevel": "beginner"
    }
  ],
  "peopleAffected": 25,
  "urgencyLevel": 8
}
```

### Get Incidents Near Location
```bash
GET /api/incidents?near=-122.4194,37.7749&maxDistance=5000
Authorization: Bearer <token>
```

### Match Volunteers for Incident
```bash
GET /api/incidents/:incidentId/match-volunteers?maxDistance=10000
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "volunteer": {
        "id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "location": { ... }
      },
      "matchedSkills": [
        {
          "skill": "swimming",
          "level": "advanced",
          "requiredLevel": "intermediate",
          "priority": "high"
        }
      ],
      "matchScore": 3,
      "distance": 1250
    }
  ]
}
```

### Escalate Incident (Coordinator)
```bash
PUT /api/incidents/:incidentId/escalate
Authorization: Bearer <coordinator-token>
```

## Assignments

### Create Assignment (Coordinator)
```bash
POST /api/assignments
Authorization: Bearer <coordinator-token>
Content-Type: application/json

{
  "incidentId": "incident-id-here",
  "volunteerId": "volunteer-id-here",
  "priority": "high",
  "estimatedDuration": 120
}
```

### Accept Assignment (Volunteer)
```bash
PUT /api/assignments/:assignmentId/accept
Authorization: Bearer <volunteer-token>
```

### Start Assignment
```bash
PUT /api/assignments/:assignmentId/start
Authorization: Bearer <volunteer-token>
```

### Complete Assignment
```bash
PUT /api/assignments/:assignmentId/complete
Authorization: Bearer <volunteer-token>
Content-Type: application/json

{
  "actualDuration": 135,
  "rating": 5,
  "feedback": "Successfully rescued all affected people"
}
```

## Socket.io Client Example

```javascript
import io from 'socket.io-client';

// Connect with JWT token
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token-here'
  }
});

// Listen for new incidents nearby
socket.on('new-incident-nearby', (data) => {
  console.log('New incident:', data.incident);
  // Update UI with new incident
});

// Listen for assignment requests
socket.on('assignment-request', (data) => {
  console.log('New assignment:', data.assignment);
  // Show notification to volunteer
});

// Listen for assignment acceptance
socket.on('assignment-accepted', (data) => {
  console.log('Assignment accepted:', data.assignment);
  // Update coordinator dashboard
});

// Update location
socket.emit('update-location', {
  coordinates: [-122.4194, 37.7749],
  address: 'New location'
});
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

