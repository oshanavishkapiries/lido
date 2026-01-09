# LIDO Backend API Documentation

## Base URL

```
http://localhost:3125/api/v1
```

## Authentication

Currently, the API uses anonymous authentication. No API keys or tokens are required.

---

## Session Endpoints

### Create Session

Create a new meeting session with a host.

**Endpoint:** `POST /session/create`

**Request Body:**

```json
{
  "sessionName": "Team Standup",
  "hostName": "John Doe",
  "settings": {
    "allowAnonymous": true,
    "maxParticipants": 100,
    "enablePolls": true,
    "enableQA": true,
    "enableReactions": true
  }
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Session created successfully",
  "data": {
    "sessionId": "AB1234",
    "sessionName": "Team Standup",
    "hostName": "John Doe",
    "settings": { ... }
  }
}
```

---

### Get Session by ID

Retrieve session details.

**Endpoint:** `GET /session/:sessionId`

**Response:**

```json
{
  "status": "success",
  "message": "Session fetched successfully",
  "data": {
    "sessionId": "AB1234",
    "sessionName": "Team Standup",
    "hostName": "John Doe",
    "isActive": true,
    "participants": [...],
    "settings": {...},
    "createdAt": "2026-01-09T14:00:00.000Z"
  }
}
```

---

### Join Session

Add a participant to a session.

**Endpoint:** `POST /session/:sessionId/join`

**Request Body:**

```json
{
  "participantName": "Jane Smith"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Participant added successfully",
  "data": { ... }
}
```

---

### Leave Session

Remove a participant from a session.

**Endpoint:** `POST /session/:sessionId/leave`

**Request Body:**

```json
{
  "participantName": "Jane Smith"
}
```

---

### Get Participants

Get all active participants in a session.

**Endpoint:** `GET /session/:sessionId/participants`

**Response:**

```json
{
  "status": "success",
  "message": "Participants fetched successfully",
  "data": [
    {
      "name": "John Doe",
      "joinedAt": "2026-01-09T14:00:00.000Z",
      "isActive": true,
      "lastSeen": "2026-01-09T14:30:00.000Z"
    }
  ]
}
```

---

### Update Session Settings

Update session configuration.

**Endpoint:** `PUT /session/:sessionId/settings`

**Request Body:**

```json
{
  "settings": {
    "maxParticipants": 50,
    "enablePolls": false
  }
}
```

---

### End Session

Terminate a session.

**Endpoint:** `PUT /session/:sessionId/end`

**Response:**

```json
{
  "status": "success",
  "message": "Session ended successfully"
}
```

---

## Message Endpoints

### Get Messages

Retrieve messages for a session with pagination.

**Endpoint:** `GET /messages/:sessionId?limit=50&offset=0`

**Query Parameters:**

- `limit` (optional): Number of messages to retrieve (default: 50)
- `offset` (optional): Number of messages to skip (default: 0)

**Response:**

```json
{
  "status": "success",
  "message": "Messages fetched successfully",
  "data": {
    "messages": [...],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 150
    }
  }
}
```

---

### Delete Message

Soft delete a message (host only).

**Endpoint:** `DELETE /messages/:messageId`

**Request Body:**

```json
{
  "deletedBy": "John Doe"
}
```

---

### Add Reaction

Add an emoji reaction to a message.

**Endpoint:** `POST /messages/:messageId/reaction`

**Request Body:**

```json
{
  "emoji": "👍",
  "userName": "Jane Smith"
}
```

---

### Remove Reaction

Remove an emoji reaction from a message.

**Endpoint:** `DELETE /messages/:messageId/reaction`

**Request Body:**

```json
{
  "emoji": "👍",
  "userName": "Jane Smith"
}
```

---

### Upvote Message

Upvote a message (for Q&A).

**Endpoint:** `POST /messages/:messageId/upvote`

**Request Body:**

```json
{
  "userName": "Jane Smith"
}
```

---

### Remove Upvote

Remove upvote from a message.

**Endpoint:** `DELETE /messages/:messageId/upvote`

**Request Body:**

```json
{
  "userName": "Jane Smith"
}
```

---

## Poll Endpoints

### Create Poll

Create a new poll in a session.

**Endpoint:** `POST /polls`

**Request Body:**

```json
{
  "sessionId": "AB1234",
  "question": "What time works best?",
  "options": ["9 AM", "10 AM", "11 AM"],
  "createdBy": "John Doe",
  "duration": 5
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Poll created successfully",
  "data": {
    "_id": "...",
    "sessionId": "AB1234",
    "question": "What time works best?",
    "options": [...],
    "isActive": true,
    "expiresAt": "2026-01-09T14:35:00.000Z"
  }
}
```

---

### Vote on Poll

Cast a vote on a poll option.

**Endpoint:** `POST /polls/:pollId/vote`

**Request Body:**

```json
{
  "optionIndex": 1,
  "userName": "Jane Smith"
}
```

---

### Get Poll Results

Get current poll results.

**Endpoint:** `GET /polls/:pollId/results`

**Response:**

```json
{
  "status": "success",
  "message": "Poll results fetched successfully",
  "data": {
    "pollId": "...",
    "question": "What time works best?",
    "isActive": true,
    "totalVotes": 10,
    "options": [
      {
        "text": "9 AM",
        "voteCount": 3,
        "percentage": "30.00"
      },
      {
        "text": "10 AM",
        "voteCount": 5,
        "percentage": "50.00"
      },
      {
        "text": "11 AM",
        "voteCount": 2,
        "percentage": "20.00"
      }
    ]
  }
}
```

---

### Get Active Polls

Get all active polls for a session.

**Endpoint:** `GET /polls/session/:sessionId/active`

---

### Get All Polls

Get all polls (active and closed) for a session.

**Endpoint:** `GET /polls/session/:sessionId`

---

### Close Poll

Manually close a poll.

**Endpoint:** `PUT /polls/:pollId/close`

---

## Socket.io Events

### Client → Server Events

#### join-session

Join a session room.

```javascript
socket.emit("join-session", {
  sessionId: "AB1234",
  userName: "Jane Smith",
});
```

#### leave-session

Leave a session room.

```javascript
socket.emit("leave-session", {
  sessionId: "AB1234",
  userName: "Jane Smith",
});
```

#### send-message

Send a message to the session.

```javascript
socket.emit("send-message", {
  sessionId: "AB1234",
  userName: "Jane Smith",
  message: "Hello everyone!",
  type: "message", // or 'question', 'announcement'
});
```

#### typing

Indicate user is typing.

```javascript
socket.emit("typing", {
  sessionId: "AB1234",
  userName: "Jane Smith",
});
```

#### stop-typing

Indicate user stopped typing.

```javascript
socket.emit("stop-typing", {
  sessionId: "AB1234",
  userName: "Jane Smith",
});
```

#### create-poll

Create a new poll.

```javascript
socket.emit("create-poll", {
  sessionId: "AB1234",
  question: "What time works best?",
  options: ["9 AM", "10 AM", "11 AM"],
  createdBy: "John Doe",
  duration: 5,
});
```

#### vote-poll

Vote on a poll.

```javascript
socket.emit("vote-poll", {
  pollId: "...",
  optionIndex: 1,
  userName: "Jane Smith",
});
```

#### add-reaction

Add reaction to a message.

```javascript
socket.emit("add-reaction", {
  messageId: "...",
  emoji: "👍",
  userName: "Jane Smith",
});
```

#### upvote-message

Upvote a message.

```javascript
socket.emit("upvote-message", {
  messageId: "...",
  userName: "Jane Smith",
});
```

---

### Server → Client Events

#### joined-session

Confirmation that user joined successfully.

```javascript
socket.on("joined-session", (data) => {
  // data: { sessionId, userName, participants }
});
```

#### participant-joined

A new participant joined the session.

```javascript
socket.on("participant-joined", (data) => {
  // data: { userName, participants, timestamp }
});
```

#### participant-left

A participant left the session.

```javascript
socket.on("participant-left", (data) => {
  // data: { userName, participants, timestamp }
});
```

#### new-message

A new message was sent.

```javascript
socket.on("new-message", (data) => {
  // data: { id, sessionId, senderName, content, type, reactions, upvotes, timestamp }
});
```

#### user-typing

A user is typing.

```javascript
socket.on("user-typing", (data) => {
  // data: { userName }
});
```

#### user-stop-typing

A user stopped typing.

```javascript
socket.on("user-stop-typing", (data) => {
  // data: { userName }
});
```

#### poll-created

A new poll was created.

```javascript
socket.on("poll-created", (poll) => {
  // poll object
});
```

#### poll-updated

Poll results were updated.

```javascript
socket.on("poll-updated", (results) => {
  // results object
});
```

#### reaction-added

A reaction was added to a message.

```javascript
socket.on("reaction-added", (data) => {
  // data: { messageId, reactions }
});
```

#### message-upvoted

A message was upvoted.

```javascript
socket.on("message-upvoted", (data) => {
  // data: { messageId, upvotes }
});
```

#### error

An error occurred.

```javascript
socket.on("error", (data) => {
  // data: { message }
});
```

---

## Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

Common HTTP status codes:

- `400` - Bad Request (missing or invalid parameters)
- `403` - Forbidden (e.g., session full)
- `404` - Not Found (session or resource not found)
- `500` - Internal Server Error

---

## Example Usage

### Creating and Joining a Session

```javascript
// 1. Create session
const response = await fetch("http://localhost:3125/api/v1/session/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sessionName: "Team Meeting",
    hostName: "John Doe",
  }),
});
const { data } = await response.json();
const sessionId = data.sessionId; // e.g., "AB1234"

// 2. Connect to Socket.io
const socket = io("http://localhost:3125");

// 3. Join session
socket.emit("join-session", {
  sessionId: sessionId,
  userName: "Jane Smith",
});

// 4. Listen for messages
socket.on("new-message", (message) => {
  console.log("New message:", message);
});

// 5. Send a message
socket.emit("send-message", {
  sessionId: sessionId,
  userName: "Jane Smith",
  message: "Hello everyone!",
});
```
