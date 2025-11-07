# FlowSpace - Design & Architecture Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Database Schema](#database-schema)
4. [System Flow Diagrams](#system-flow-diagrams)
5. [Component Architecture](#component-architecture)
6. [API Documentation](#api-documentation)
7. [Wireframes](#wireframes)
8. [Technology Stack](#technology-stack)

---

## 1. System Overview

### 1.1 Purpose
FlowSpace is a real-time collaborative Kanban board application designed for modern teams. It combines visual task management with rich text note-taking capabilities, all synchronized in real-time across team members.

### 1.2 Key Features
- **Real-time Kanban Boards**: Drag-and-drop cards with instant synchronization
- **Team Collaboration**: User avatars, activity tracking, and presence indicators
- **Rich Text Notes**: Google Docs-like editor with 15 fonts, formatting, and colors
- **Secure Authentication**: Firebase Auth with JWT backend validation
- **Team Management**: Role-based permissions (Owner, Editor, Viewer)
- **Email Invitations**: SMTP-powered invite system with expiring tokens

### 1.3 Design Philosophy
- **Glass-morphism UI**: Modern, futuristic design with transparency and blur effects
- **Real-time First**: All actions sync instantly using Socket.io
- **User Attribution**: Every action shows who did what with avatars
- **Mobile Responsive**: Works seamlessly across all device sizes

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           React 18 + TypeScript                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Components                                     │  │  │
│  │  │  - Landing Page                                 │  │  │
│  │  │  - Kanban Board (GlassyKanbanBoard)           │  │  │
│  │  │  - Notes Panel (RichTextEditor)               │  │  │
│  │  │  - Activity Feed                                │  │  │
│  │  │  - Team Management                              │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  State Management                               │  │  │
│  │  │  - AuthContext (Firebase + JWT)                │  │  │
│  │  │  - BoardContext (Cards, Boards)                │  │  │
│  │  │  - React Query (Server State)                  │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Real-time Layer                                │  │  │
│  │  │  - Socket.io Client                            │  │  │
│  │  │  - Event Listeners (card:*, activity:*)        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            │ HTTPS/WSS                      │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                         PROXY TIER                           │
├────────────────────────────┼────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Nginx Reverse Proxy                │  │
│  │                                                        │  │
│  │  /api/* → Backend (Port 8001)                        │  │
│  │  /*     → Frontend (Port 3000)                       │  │
│  │                                                        │  │
│  │  Features:                                            │  │
│  │  - SSL/TLS Termination                               │  │
│  │  - Load Balancing                                     │  │
│  │  - Request Routing                                    │  │
│  │  - WebSocket Upgrade                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                        SERVER TIER                           │
├────────────────────────────┼────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Node.js + Express + TypeScript                 │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Controllers                                    │  │  │
│  │  │  - authController (Firebase JWT exchange)      │  │  │
│  │  │  - boardsController (CRUD operations)          │  │  │
│  │  │  - cardsController (CRUD + populate users)     │  │  │
│  │  │  - inviteController (Token generation)         │  │  │
│  │  │  - activityController (Feed management)        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Middleware                                     │  │  │
│  │  │  - authMiddleware (JWT validation)             │  │  │
│  │  │  - errorHandler (Global error handling)        │  │  │
│  │  │  - CORS (Cross-origin config)                  │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Socket.io Server                               │  │  │
│  │  │  - Connection Management                        │  │  │
│  │  │  - Room Management (Board-based)               │  │  │
│  │  │  - Event Broadcasting                           │  │  │
│  │  │    * card:create, card:update, card:delete     │  │  │
│  │  │    * activity:new                               │  │  │
│  │  │    * board:member-joined                        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  External Services                              │  │  │
│  │  │  - Nodemailer (SMTP Email)                     │  │  │
│  │  │  - Firebase Admin SDK                           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                      DATABASE TIER                           │
├────────────────────────────┼────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    MongoDB                            │  │
│  │                                                        │  │
│  │  Collections:                                         │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │  users                                       │    │  │
│  │  │  - Authentication data                       │    │  │
│  │  │  - Profile information                       │    │  │
│  │  │  - Avatar URLs                               │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │  boards                                      │    │  │
│  │  │  - Board metadata                            │    │  │
│  │  │  - Member list with roles                    │    │  │
│  │  │  - Column definitions                        │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │  cards                                       │    │  │
│  │  │  - Task information                          │    │  │
│  │  │  - User attribution (createdBy, updatedBy)  │    │  │
│  │  │  - Tags, due dates                           │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │  invites                                     │    │  │
│  │  │  - Invite tokens                             │    │  │
│  │  │  - Expiration dates                          │    │  │
│  │  │  - Role assignments                          │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │  activities                                  │    │  │
│  │  │  - Action logs                               │    │  │
│  │  │  - User references                           │    │  │
│  │  │  - Timestamps                                │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │  notes                                       │    │  │
│  │  │  - Rich text content                         │    │  │
│  │  │  - Board associations                        │    │  │
│  │  │  - Collaborative editing state               │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  │  Features:                                            │  │
│  │  - Indexes on frequently queried fields              │  │
│  │  - Reference population (virtuals)                   │  │
│  │  - Timestamps (createdAt, updatedAt)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                          │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Firebase Authentication    Gmail SMTP      Dicebear API      │
│  - User sign in/up         - Email invites  - Avatar gen     │
│  - Token generation        - Notifications  - Fallback imgs   │
│  - Session management      - Alerts                            │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 Collections Overview

```
MongoDB Database: flowspace
├── users
├── boards
├── cards
├── invites
├── activities
├── notes
└── teams
```

### 3.2 Detailed Schema Definitions

#### 3.2.1 Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (optional - for Firebase users),
  name: String (required),
  avatarUrl: String (optional),
  firebaseUid: String (optional, unique),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
- email: 1 (unique)
- firebaseUid: 1 (unique, sparse)

// Example Document
{
  "_id": ObjectId("6543210fedcba9876543210f"),
  "email": "john@example.com",
  "name": "John Doe",
  "avatarUrl": "https://api.dicebear.com/7.x/initials/svg?seed=John",
  "firebaseUid": "abc123xyz789",
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

#### 3.2.2 Boards Collection

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (optional),
  ownerId: ObjectId (ref: User, required),
  members: [
    {
      userId: ObjectId (ref: User),
      role: Enum['owner', 'editor', 'viewer']
    }
  ],
  columns: [
    {
      _id: ObjectId,
      title: String,
      order: Number
    }
  ],
  settings: {
    isPublic: Boolean,
    allowComments: Boolean
  },
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
- ownerId: 1
- "members.userId": 1
- createdAt: -1

// Example Document
{
  "_id": ObjectId("board123"),
  "title": "Website Redesign",
  "description": "Q1 2024 Website Overhaul",
  "ownerId": ObjectId("user123"),
  "members": [
    {
      "userId": ObjectId("user123"),
      "role": "owner"
    },
    {
      "userId": ObjectId("user456"),
      "role": "editor"
    }
  ],
  "columns": [
    { "_id": ObjectId("col1"), "title": "To Do", "order": 1 },
    { "_id": ObjectId("col2"), "title": "In Progress", "order": 2 },
    { "_id": ObjectId("col3"), "title": "Review", "order": 3 },
    { "_id": ObjectId("col4"), "title": "Done", "order": 4 }
  ],
  "settings": {
    "isPublic": false,
    "allowComments": true
  },
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-16T14:20:00Z")
}
```

#### 3.2.3 Cards Collection

```javascript
{
  _id: ObjectId,
  boardId: ObjectId (ref: Board, required),
  columnId: ObjectId (required),
  title: String (required),
  description: String (optional),
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  assigneeId: ObjectId (ref: User, optional),
  tags: [String],
  dueDate: Date (optional),
  order: Number (for sorting),
  history: [
    {
      action: String,
      userId: ObjectId (ref: User),
      timestamp: Date,
      changes: Object
    }
  ],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
- boardId: 1, columnId: 1, order: 1
- createdBy: 1
- assigneeId: 1
- dueDate: 1

// Example Document
{
  "_id": ObjectId("card789"),
  "boardId": ObjectId("board123"),
  "columnId": ObjectId("col1"),
  "title": "Design homepage mockup",
  "description": "Create high-fidelity designs for hero section",
  "createdBy": ObjectId("user123"),
  "updatedBy": ObjectId("user123"),
  "assigneeId": ObjectId("user456"),
  "tags": ["Design", "High Priority"],
  "dueDate": ISODate("2024-01-20T23:59:59Z"),
  "order": 1000,
  "history": [],
  "createdAt": ISODate("2024-01-15T11:00:00Z"),
  "updatedAt": ISODate("2024-01-15T11:00:00Z")
}
```

#### 3.2.4 Invites Collection

```javascript
{
  _id: ObjectId,
  boardId: ObjectId (ref: Board, required),
  invitedBy: ObjectId (ref: User, required),
  email: String (required),
  token: String (unique, required),
  role: Enum['editor', 'viewer'] (required),
  status: Enum['pending', 'accepted', 'expired'],
  expiresAt: Date (required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
- token: 1 (unique)
- boardId: 1, email: 1
- expiresAt: 1 (TTL index)
- status: 1

// Example Document
{
  "_id": ObjectId("invite321"),
  "boardId": ObjectId("board123"),
  "invitedBy": ObjectId("user123"),
  "email": "sarah@example.com",
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "role": "editor",
  "status": "pending",
  "expiresAt": ISODate("2024-01-22T10:30:00Z"),
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

#### 3.2.5 Activities Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  boardId: ObjectId (ref: Board, required),
  action: String (required),
  entityType: Enum['card', 'note', 'board', 'user'],
  entityId: ObjectId (optional),
  metadata: Object (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
- boardId: 1, createdAt: -1
- userId: 1, createdAt: -1
- createdAt: -1 (for pagination)

// Example Document
{
  "_id": ObjectId("activity555"),
  "userId": ObjectId("user123"),
  "boardId": ObjectId("board123"),
  "action": "created card \"Design homepage mockup\"",
  "entityType": "card",
  "entityId": ObjectId("card789"),
  "metadata": {
    "cardTitle": "Design homepage mockup",
    "columnId": ObjectId("col1")
  },
  "createdAt": ISODate("2024-01-15T11:00:00Z"),
  "updatedAt": ISODate("2024-01-15T11:00:00Z")
}
```

#### 3.2.6 Notes Collection

```javascript
{
  _id: ObjectId,
  boardId: ObjectId (ref: Board, required),
  content: String (HTML/rich text),
  lastEditedBy: ObjectId (ref: User),
  version: Number,
  collaborators: [ObjectId] (refs: User),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
- boardId: 1 (unique)
- lastEditedBy: 1
- updatedAt: -1

// Example Document
{
  "_id": ObjectId("note999"),
  "boardId": ObjectId("board123"),
  "content": "<h1>Meeting Notes</h1><p>Discussed homepage redesign...</p>",
  "lastEditedBy": ObjectId("user123"),
  "version": 5,
  "collaborators": [
    ObjectId("user123"),
    ObjectId("user456")
  ],
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T15:45:00Z")
}
```

### 3.3 Entity Relationship Diagram

```
┌─────────────┐
│    Users    │
│─────────────│
│ _id         │◄──────────┐
│ email       │           │
│ name        │           │
│ avatarUrl   │           │
└─────────────┘           │
       │                  │
       │ owns             │ members
       │                  │
       ▼                  │
┌─────────────┐           │
│   Boards    │───────────┘
│─────────────│
│ _id         │◄────────────────┐
│ title       │                 │
│ ownerId     │                 │
│ members[]   │                 │
│ columns[]   │                 │
└─────────────┘                 │
       │                        │
       │ has cards              │ boardId
       │                        │
       ▼                        │
┌─────────────┐                 │
│    Cards    │                 │
│─────────────│                 │
│ _id         │                 │
│ boardId     │─────────────────┘
│ columnId    │
│ title       │
│ createdBy   │─────┐
│ updatedBy   │     │ references
│ assigneeId  │     │
└─────────────┘     │
                    │
       ┌────────────┴────────────┐
       │                         │
       ▼                         ▼
┌─────────────┐          ┌─────────────┐
│  Invites    │          │ Activities  │
│─────────────│          │─────────────│
│ _id         │          │ _id         │
│ boardId     │          │ userId      │
│ invitedBy   │          │ boardId     │
│ email       │          │ action      │
│ token       │          │ entityType  │
│ role        │          │ entityId    │
│ status      │          └─────────────┘
└─────────────┘
       
       ▼ accepts invite
       
┌─────────────┐
│    Notes    │
│─────────────│
│ _id         │
│ boardId     │
│ content     │
│ lastEditedBy│
└─────────────┘
```

---

## 4. System Flow Diagrams

### 4.1 User Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. Sign In with Email/Password
     ▼
┌────────────────┐
│  Firebase Auth │
└────┬───────────┘
     │
     │ 2. Returns Firebase ID Token
     ▼
┌────────────────┐
│  Client        │
└────┬───────────┘
     │
     │ 3. POST /api/auth/firebase-login
     │    { firebaseToken }
     ▼
┌────────────────────┐
│  Backend Server    │
│  ──────────────    │
│  1. Verify token   │
│  2. Get user info  │
│  3. Create/Update  │
│     user in DB     │
│  4. Generate JWT   │
└────┬───────────────┘
     │
     │ 4. Returns { accessToken, refreshToken, user }
     ▼
┌────────────────┐
│  Client        │
│  ──────────    │
│  Stores tokens │
│  in localStorage│
└────┬───────────┘
     │
     │ 5. All subsequent requests include
     │    Authorization: Bearer <JWT>
     ▼
┌────────────────────┐
│  Protected Routes  │
│  authMiddleware    │
│  validates JWT     │
└────────────────────┘
```

### 4.2 Real-time Card Update Flow

```
┌──────────┐                    ┌──────────┐
│ User A   │                    │ User B   │
│ Browser  │                    │ Browser  │
└────┬─────┘                    └────┬─────┘
     │                               │
     │ 1. User drags card            │
     │    "Design Homepage"          │
     │    from "To Do" to            │
     │    "In Progress"              │
     ▼                               │
┌──────────────────┐                │
│  React Component │                │
│  (DnD Handler)   │                │
└────┬─────────────┘                │
     │                               │
     │ 2. PUT /api/cards/:id         │
     │    { columnId: "col2" }       │
     ▼                               │
┌──────────────────────────┐        │
│  Backend API             │        │
│  ────────────            │        │
│  1. Validate JWT         │        │
│  2. Update card in DB    │        │
│  3. Populate user data   │        │
└────┬─────────────────────┘        │
     │                               │
     │ 3. io.emit('card:update',    │
     │           updatedCard)        │
     ▼                               │
┌──────────────────────────┐        │
│  Socket.io Server        │        │
│  Broadcasts to all       │        │
│  connected clients       │        │
└────┬─────────────────┬───┘        │
     │                 │            │
     │ 4. card:update  │ 4. card:update
     ▼                 ▼            ▼
┌──────────┐      ┌──────────┐
│ User A   │      │ User B   │
│ Browser  │      │ Browser  │
└────┬─────┘      └────┬─────┘
     │                 │
     │ 5. Update local │ 5. Update local
     │    state        │    state
     ▼                 ▼
┌──────────┐      ┌──────────┐
│ UI       │      │ UI       │
│ Re-render│      │ Re-render│
│ Card     │      │ Card     │
│ moved!   │      │ moved!   │
└──────────┘      └──────────┘

Total time: < 100ms (Real-time sync)
```

### 4.3 Team Invitation Flow

```
┌────────────┐
│  Owner     │
└─────┬──────┘
      │
      │ 1. Navigate to /invite
      │    Select board, enter email
      ▼
┌─────────────────────┐
│  Invite Page        │
│  ───────────        │
│  - Board dropdown   │
│  - Email input      │
│  - Role selector    │
└─────┬───────────────┘
      │
      │ 2. POST /api/invite
      │    { boardId, email, role }
      ▼
┌─────────────────────────────┐
│  Backend                    │
│  ────────                   │
│  1. Verify board ownership  │
│  2. Generate unique token   │
│  3. Set expiry (7 days)     │
│  4. Save to DB              │
│  5. Send email via SMTP     │
└─────┬───────────────────────┘
      │
      │ 3. Email sent with link:
      │    /invite/abc123...xyz
      ▼
┌─────────────────┐
│  Invited User   │
│  Email Client   │
└─────┬───────────┘
      │
      │ 4. Clicks invite link
      ▼
┌─────────────────────────┐
│  Accept Invite Page     │
│  ─────────────────      │
│  1. Check auth status   │
│  2. Redirect to login   │
│     if not authenticated│
└─────┬───────────────────┘
      │
      │ 5. POST /api/invite/:token/accept
      ▼
┌─────────────────────────────┐
│  Backend                    │
│  ────────                   │
│  1. Validate token          │
│  2. Check expiry            │
│  3. Add user to board       │
│     members with role       │
│  4. Mark invite as accepted │
│  5. Emit socket event       │
└─────┬───────────────────────┘
      │
      │ 6. io.emit('board:member-joined')
      ▼
┌─────────────────┐
│  All Board      │
│  Members        │
│  ────────       │
│  See new member │
│  in real-time   │
└─────────────────┘
```

### 4.4 Activity Logging Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ Any action: create/update/delete card
     ▼
┌─────────────────────┐
│  Backend Controller │
│  (cards, notes)     │
└────┬────────────────┘
     │
     │ 1. Perform main operation
     ▼
┌─────────────────────┐
│  Database           │
│  Update completed   │
└────┬────────────────┘
     │
     │ 2. Log activity
     ▼
┌─────────────────────────────┐
│  Activity Model             │
│  ─────────────             │
│  Create document:           │
│  {                          │
│    userId,                  │
│    boardId,                 │
│    action: "created card X",│
│    entityType: "card",      │
│    entityId: cardId         │
│  }                          │
└────┬────────────────────────┘
     │
     │ 3. Populate user data
     │    (name, email, avatarUrl)
     ▼
┌─────────────────────────────┐
│  Activity with User Data    │
└────┬────────────────────────┘
     │
     │ 4. io.emit('activity:new')
     ▼
┌─────────────────────────────┐
│  All Clients                │
│  ─────────────             │
│  Listen for 'activity:new'  │
│  Update activity feed       │
│  Show user avatar + action  │
└─────────────────────────────┘
```

---

## 5. Component Architecture

### 5.1 Frontend Component Tree

```
App.tsx
├── ThemeProvider
│   └── AuthProvider
│       └── BoardProvider
│           └── QueryClientProvider
│               └── Router
│                   ├── Index (Landing Page)
│                   │   ├── HeroSection
│                   │   │   ├── AnimatedText
│                   │   │   └── IndexPreview
│                   │   ├── FeatureSection
│                   │   │   └── FeatureCard[] (x6)
│                   │   └── StatsSection
│                   │       └── StatCard[] (x3)
│                   │
│                   ├── Login
│                   │   ├── FirebaseAuth
│                   │   └── SignInForm / SignUpForm
│                   │
│                   ├── Boards (List)
│                   │   ├── CreateBoardDialog
│                   │   └── BoardCard[]
│                   │
│                   ├── Board (Main Workspace)
│                   │   ├── GlassyKanbanBoard
│                   │   │   ├── DndContext
│                   │   │   └── GlassColumn[] (x4)
│                   │   │       ├── ColumnHeader
│                   │   │       │   ├── Icon
│                   │   │       │   └── Badge (count)
│                   │   │       ├── SortableContext
│                   │   │       │   └── GlassCard[]
│                   │   │       │       ├── Title
│                   │   │       │       ├── Description
│                   │   │       │       ├── Tags[]
│                   │   │       │       └── CardFooter
│                   │   │       │           ├── Avatar
│                   │   │       │           └── DueDate
│                   │   │       └── AddCardButton
│                   │   │
│                   │   ├── CardDialog
│                   │   │   ├── Input (title)
│                   │   │   ├── Textarea (description)
│                   │   │   ├── TagInput
│                   │   │   ├── DatePicker
│                   │   │   └── Actions
│                   │   │       ├── Save
│                   │   │       └── Delete
│                   │   │
│                   │   └── NotesPanel
│                   │       ├── Header
│                   │       │   ├── Icon
│                   │       │   ├── Title
│                   │       │   └── MemberAvatars[]
│                   │       ├── RichTextEditor
│                   │       │   ├── Toolbar
│                   │       │   │   ├── HeaderDropdown
│                   │       │   │   ├── FontDropdown
│                   │       │   │   ├── SizeButtons
│                   │       │   │   ├── FormatButtons
│                   │       │   │   ├── ColorPicker
│                   │       │   │   └── ListButtons
│                   │       │   └── Editor (Quill)
│                   │       └── SaveIndicator
│                   │
│                   ├── Activity
│                   │   ├── Header
│                   │   │   ├── Title
│                   │   │   └── LiveBadge
│                   │   └── ActivityFeed
│                   │       └── ActivityItem[]
│                   │           ├── UserAvatar
│                   │           ├── ActionText
│                   │           ├── Timestamp
│                   │           └── ActionIcon
│                   │
│                   ├── Invite
│                   │   ├── BoardSelector
│                   │   ├── EmailInput
│                   │   ├── RoleSelector
│                   │   ├── SendButton
│                   │   └── InviteLinkDisplay
│                   │
│                   ├── AcceptInvite
│                   │   ├── LoadingState
│                   │   ├── SuccessState
│                   │   │   ├── Icon
│                   │   │   ├── Message
│                   │   │   └── BoardInfo
│                   │   └── ErrorState
│                   │
│                   ├── Profile
│                   │   ├── AvatarUpload
│                   │   ├── UserInfo
│                   │   └── Actions
│                   │
│                   └── Settings
│                       ├── ThemeToggle
│                       ├── NotificationSettings
│                       └── DataExport
│
└── Toaster (Global notifications)
```

### 5.2 State Management Architecture

```
┌───────────────────────────────────────────────┐
│            Application State                  │
├───────────────────────────────────────────────┤
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │  Auth State (AuthContext)               │ │
│  │  ─────────────────────────              │ │
│  │  - user: User | null                    │ │
│  │  - isAuthenticated: boolean             │ │
│  │  - isLoading: boolean                   │ │
│  │  - token: string                        │ │
│  │                                         │ │
│  │  Methods:                               │ │
│  │  - signIn(email, password)              │ │
│  │  - signUp(email, password, name)        │ │
│  │  - signOut()                            │ │
│  │  - refreshToken()                       │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │  Board State (BoardContext)             │ │
│  │  ──────────────────────────             │ │
│  │  - boards: Board[]                      │ │
│  │  - currentBoard: Board | null           │ │
│  │  - cards: Card[]                        │ │
│  │  - isLoading: boolean                   │ │
│  │                                         │ │
│  │  Methods:                               │ │
│  │  - refreshBoards()                      │ │
│  │  - selectBoard(id)                      │ │
│  │  - createBoard(data)                    │ │
│  │  - setCards(cards)                      │ │
│  │                                         │ │
│  │  Socket Listeners:                      │ │
│  │  - card:create → add to cards           │ │
│  │  - card:update → update in cards        │ │
│  │  - card:delete → remove from cards      │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │  Server State (React Query)             │ │
│  │  ──────────────────────────             │ │
│  │  Cached Queries:                        │ │
│  │  - boards                               │ │
│  │  - board/:id                            │ │
│  │  - cards/:boardId                       │ │
│  │  - activities                           │ │
│  │  - invites/:boardId                     │ │
│  │                                         │ │
│  │  Features:                              │ │
│  │  - Automatic refetching                 │ │
│  │  - Cache invalidation                   │ │
│  │  - Optimistic updates                   │ │
│  └─────────────────────────────────────────┘ │
│                                               │
└───────────────────────────────────────────────┘
```

### 5.3 Real-time Event System

```
Socket.io Events

Client → Server:
- joinBoard(boardId)
- leaveBoard(boardId)

Server → Client:
┌────────────────────────────────────────┐
│  Card Events                           │
├────────────────────────────────────────┤
│  card:create  → { card }               │
│  card:update  → { card }               │
│  card:delete  → { id }                 │
│  card:moved   → { cardId, columnId }   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  Activity Events                       │
├────────────────────────────────────────┤
│  activity:new → { activity }           │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  Board Events                          │
├────────────────────────────────────────┤
│  board:member-joined → { boardId,      │
│                         userId }       │
│  board:updated → { board }             │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  Note Events                           │
├────────────────────────────────────────┤
│  note:updated → { noteId, content }    │
│  note:editing → { userId, noteId }     │
└────────────────────────────────────────┘
```

---

## 6. API Documentation

### 6.1 Authentication Endpoints

#### POST /api/auth/firebase-login
**Description**: Exchange Firebase ID token for JWT
**Request**:
```json
{
  "firebaseToken": "eyJhbGciOiJSUzI1NiIs..."
}
```
**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://..."
  }
}
```

#### POST /api/auth/logout
**Description**: Logout user
**Headers**: `Authorization: Bearer <token>`
**Response**: `{ message: "Logged out successfully" }`

### 6.2 Board Endpoints

#### GET /api/boards
**Description**: List all boards user has access to
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
{
  "boards": [
    {
      "_id": "board123",
      "title": "Website Redesign",
      "description": "Q1 2024 Project",
      "ownerId": "user123",
      "members": [...],
      "columns": [...],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/boards
**Description**: Create new board
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "title": "New Project",
  "description": "Project description"
}
```
**Response**:
```json
{
  "board": { "_id": "...", ... }
}
```

#### GET /api/boards/:id
**Description**: Get board details
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
{
  "board": { "_id": "...", "title": "...", ... }
}
```

#### PUT /api/boards/:id
**Description**: Update board
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### DELETE /api/boards/:id
**Description**: Delete board (owner only)
**Headers**: `Authorization: Bearer <token>`
**Response**: `{ ok: true }`

### 6.3 Card Endpoints

#### GET /api/cards/:boardId/cards
**Description**: List all cards in a board
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
{
  "cards": [
    {
      "_id": "card123",
      "boardId": "board123",
      "columnId": "col1",
      "title": "Design homepage",
      "description": "Create mockups",
      "createdBy": {
        "_id": "user123",
        "name": "John Doe",
        "avatarUrl": "..."
      },
      "updatedBy": { ... },
      "tags": ["Design", "High Priority"],
      "dueDate": "2024-01-20T00:00:00Z",
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

#### POST /api/cards/:boardId/cards
**Description**: Create new card
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "columnId": "col1",
  "title": "New Task",
  "description": "Task description",
  "tags": ["Tag1", "Tag2"],
  "dueDate": "2024-01-25T00:00:00Z"
}
```
**Response**:
```json
{
  "card": { "_id": "...", ... }
}
```

#### PUT /api/cards/:id
**Description**: Update card
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "title": "Updated title",
  "columnId": "col2",
  "tags": ["New Tag"]
}
```

#### DELETE /api/cards/:id
**Description**: Delete card
**Headers**: `Authorization: Bearer <token>`
**Response**: `{ ok: true }`

### 6.4 Invite Endpoints

#### POST /api/invite
**Description**: Send board invitation
**Headers**: `Authorization: Bearer <token>`
**Request**:
```json
{
  "boardId": "board123",
  "email": "teammate@example.com",
  "role": "editor"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Invite sent successfully",
  "inviteLink": "https://yourapp.com/invite/abc123...",
  "token": "abc123..."
}
```

#### POST /api/invite/:token/accept
**Description**: Accept invitation
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
{
  "success": true,
  "message": "Invite accepted",
  "board": {
    "_id": "board123",
    "title": "Website Redesign",
    "description": "..."
  }
}
```

#### GET /api/invite/board/:boardId
**Description**: List board invitations (owner only)
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
{
  "invites": [
    {
      "_id": "invite123",
      "email": "user@example.com",
      "role": "editor",
      "status": "pending",
      "invitedBy": { ... },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 6.5 Activity Endpoints

#### GET /api/activity
**Description**: Get recent activities
**Headers**: `Authorization: Bearer <token>`
**Query Params**: `?limit=50&skip=0`
**Response**:
```json
{
  "activities": [
    {
      "_id": "activity123",
      "userId": {
        "_id": "user123",
        "name": "John Doe",
        "email": "john@example.com",
        "avatarUrl": "..."
      },
      "boardId": "board123",
      "action": "created card \"Design homepage\"",
      "entityType": "card",
      "entityId": "card123",
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

## 7. Wireframes

### 7.1 Landing Page

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] FlowSpace          Boards  Activity  Profile  [→]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   Work together,                    ┌────────────────────┐  │
│   achieve more                      │  [Preview]         │  │
│   ───────────────                   │  ┌──┐ ┌──┐ ┌──┐   │  │
│                                     │  │🎨│ │⚡│ │✅│   │  │
│   A sleek, real-time collaborative  │  │  │ │  │ │  │   │  │
│   workspace combining Kanban with   │  │💾│ │🔐│ │🚀│   │  │
│   powerful note-taking              │  └──┘ └──┘ └──┘   │  │
│                                     └────────────────────┘  │
│   [Sign In / Get Started]  [Explore Boards]                 │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   Everything you need to stay organized                      │
│   ──────────────────────────────────────                    │
│                                                               │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│   │ ⚡       │  │ 👥       │  │ ✓        │                │
│   │ Real-time│  │ Team     │  │ Visual   │                │
│   │ Sync     │  │ Collab   │  │ Kanban   │                │
│   │          │  │          │  │          │                │
│   │ See...   │  │ Work...  │  │ Drag...  │                │
│   └──────────┘  └──────────┘  └──────────┘                │
│                                                               │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│   │ 🔒       │  │ ✨       │  │ →        │                │
│   │ Secure   │  │ Beautiful│  │ Markdown │                │
│   │ & Private│  │ Design   │  │ Notes    │                │
│   └──────────┘  └──────────┘  └──────────┘                │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   Why Teams Love FlowSpace                                   │
│   ─────────────────────────                                 │
│                                                               │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│   │  <10ms       │  │  99.9%       │  │  ∞           │    │
│   │              │  │              │  │              │    │
│   │ Lightning    │  │ Always       │  │ Unlimited    │    │
│   │ Fast         │  │ Available    │  │ Scale        │    │
│   │              │  │              │  │              │    │
│   │ Real-time... │  │ Rock-solid...│  │ No limits... │    │
│   └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Kanban Board View

```
┌─────────────────────────────────────────────────────────────────┐
│  [←] Board: Website Redesign      [+] Invite  [⚙] Settings      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐               │
│  │✓ To Do │  │⏰ Prog │  │✨Review│  │✓ Done  │               │
│  │  [2]   │  │  [3]   │  │  [1]   │  │  [4]   │               │
│  ├────────┤  ├────────┤  ├────────┤  ├────────┤               │
│  │        │  │        │  │        │  │        │               │
│  │┌──────┐│  │┌──────┐│  │┌──────┐│  │┌──────┐│               │
│  ││Design││  ││Build ││  ││Test  ││  ││Deploy││               │
│  ││page  ││  ││API   ││  ││feat  ││  ││app   ││               │
│  ││      ││  ││      ││  ││      ││  ││      ││               │
│  ││[Tag] ││  ││[Tag] ││  ││[Tag] ││  ││[Tag] ││               │
│  ││👤Dec││  ││👤Dec││  ││👤Dec││  ││👤Dec││               │
│  │└──────┘│  │└──────┘│  │└──────┘│  │└──────┘│               │
│  │        │  │        │  │        │  │        │               │
│  │┌──────┐│  │┌──────┐│  │        │  │┌──────┐│               │
│  ││Setup ││  ││Add   ││  │        │  ││Launch││               │
│  ││DB    ││  ││auth  ││  │        │  ││site  ││               │
│  │└──────┘│  │└──────┘│  │        │  │└──────┘│               │
│  │        │  │        │  │        │  │        │               │
│  │[+ Add] │  │[+ Add] │  │[+ Add] │  │[+ Add] │               │
│  └────────┘  └────────┘  └────────┘  └────────┘               │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📝 Shared Notes                              👤👤👤 [Save]     │
│  ─────────────────────────────────────────────────────────      │
│  │ [H1▾] [Font▾] [B] [I] [U] [Color] [•] [1.] [≡]            │  │
│  ├───────────────────────────────────────────────────────      │
│  │                                                          │  │
│  │  # Meeting Notes                                         │  │
│  │                                                          │  │
│  │  - Discussed homepage design                             │  │
│  │  - Need to finalize color palette                       │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Card Dialog

```
┌─────────────────────────────────────────────┐
│  Edit Card                           [× ]   │
├─────────────────────────────────────────────┤
│                                             │
│  Title *                                    │
│  ┌─────────────────────────────────────┐  │
│  │ Design homepage mockup              │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  Description                                │
│  ┌─────────────────────────────────────┐  │
│  │ Create high-fidelity designs for    │  │
│  │ hero section and navigation         │  │
│  │                                     │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  Tags                                       │
│  ┌─────────────────────────────────────┐  │
│  │ [Design] [High Priority]  [+ Add]  │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  Due Date                                   │
│  ┌─────────────────────────────────────┐  │
│  │ 📅 Jan 20, 2024          [Select]  │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  Status                                     │
│  ┌─────────────────────────────────────┐  │
│  │ [To Do ▾]                           │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  │
│  │ [Save]  │  │ [Cancel]│  │ [Delete] │  │
│  └─────────┘  └─────────┘  └──────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### 7.4 Activity Feed

```
┌─────────────────────────────────────────────────┐
│  Activity Feed                   [● Live]       │
├─────────────────────────────────────────────────┤
│  Real-time updates from your team               │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ 👤 John Doe created card "Design page" ✓│   │
│  │    2 minutes ago                        │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ 👤 Sarah Lee updated card "Build API"  ✎│   │
│  │    5 minutes ago                        │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ 👤 Mike Chen deleted card "Old task"   🗑│   │
│  │    10 minutes ago                       │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ 👤 Sarah Lee joined the board          👥│   │
│  │    1 hour ago                           │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 7.5 Invite Page

```
┌─────────────────────────────────────────────────┐
│  Invite Members                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  Select Board                                    │
│  ┌─────────────────────────────────────────┐   │
│  │ Website Redesign              [▾]       │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  Email address                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ teammate@company.com                    │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  Role                                            │
│  ┌─────────────────────────────────────────┐   │
│  │ Editor - Can create, edit, delete  [▾] │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │ [Send Invite]   │  │ [Copy Link]      │   │
│  └──────────────────┘  └──────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ 🔗 Invite Link Generated                │   │
│  │                                         │   │
│  │ https://yourapp.com/invite/abc123...   │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  💡 Note: Invite links expire in 7 days.       │
│     Recipients must sign in to accept.          │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 8. Technology Stack

### 8.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 7.x | Build tool & dev server |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Framer Motion** | 11.x | Animation library |
| **Radix UI** | Latest | Accessible component primitives |
| **React Router** | 6.x | Client-side routing |
| **React Query** | 5.x | Server state management |
| **Socket.io Client** | 4.x | Real-time communication |
| **React Quill** | 2.x | Rich text editor |
| **DnD Kit** | Latest | Drag and drop |
| **date-fns** | 3.x | Date utilities |
| **Lucide React** | Latest | Icon library |

### 8.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20.x | Runtime environment |
| **Express** | 4.x | Web framework |
| **TypeScript** | 5.x | Type safety |
| **Socket.io** | 4.x | WebSocket server |
| **MongoDB** | 6.x | NoSQL database |
| **Mongoose** | 8.x | MongoDB ODM |
| **JWT** | 9.x | Authentication tokens |
| **Nodemailer** | 6.x | Email sending |
| **bcrypt** | 5.x | Password hashing |
| **Multer** | 1.x | File upload handling |

### 8.3 Authentication & Services

| Service | Purpose |
|---------|---------|
| **Firebase Auth** | User authentication |
| **Gmail SMTP** | Email invitations |
| **Dicebear API** | Auto-generated avatars |

### 8.4 Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | JavaScript/TypeScript linting |
| **Prettier** | Code formatting |
| **Supervisor** | Process management |
| **Nginx** | Reverse proxy |

### 8.5 Infrastructure

```
┌────────────────────────────────────────┐
│  Production Environment                │
├────────────────────────────────────────┤
│  - Nginx (Port 80/443)                 │
│  - Node.js Backend (Port 8001)         │
│  - Vite Dev Server (Port 3000)         │
│  - MongoDB (Port 27017)                │
│  - Socket.io (WebSocket upgrade)       │
└────────────────────────────────────────┘

Environment Variables:
├── Backend (.env)
│   ├── MONGO_URL
│   ├── JWT_ACCESS_SECRET
│   ├── JWT_REFRESH_SECRET
│   ├── SMTP_EMAIL
│   ├── SMTP_PASSWORD
│   ├── FRONTEND_URL
│   └── PORT
│
└── Frontend (client/.env)
    └── VITE_BACKEND_URL
```

---

## 9. Security Considerations

### 9.1 Authentication Security
- Firebase tokens validated on every request
- JWT tokens with expiration (15min access, 7day refresh)
- Passwords never stored (Firebase handles auth)
- HTTPS-only in production

### 9.2 Authorization
- Role-based access control (Owner, Editor, Viewer)
- Board membership verified on every API call
- Invite tokens are cryptographically random (32 bytes)
- Invite expiration enforced (7 days)

### 9.3 Data Protection
- MongoDB connections encrypted
- User passwords hashed with bcrypt (if used)
- Avatar URLs sanitized
- XSS protection via React's JSX escaping

### 9.4 API Security
- Rate limiting on auth endpoints
- CORS configured for known origins
- Input validation on all endpoints
- SQL injection prevention (NoSQL, but validated)

---

## 10. Performance Optimizations

### 10.1 Frontend
- Code splitting by route
- Lazy loading of components
- Optimistic UI updates
- React Query caching
- Memoization of expensive components
- Virtual scrolling for large lists

### 10.2 Backend
- Database indexes on frequent queries
- Connection pooling for MongoDB
- Response compression (gzip)
- Static asset caching
- Socket.io room-based broadcasting

### 10.3 Real-time
- Socket.io binary streaming
- Event batching for multiple updates
- Selective broadcasting (only to board members)
- Automatic reconnection with exponential backoff

---

## 11. Future Enhancements

### 11.1 Planned Features
- [ ] Card comments and discussions
- [ ] File attachments on cards
- [ ] Board templates
- [ ] Custom column creation
- [ ] Advanced filtering and search
- [ ] Mobile native apps (React Native)
- [ ] Board export (PDF, CSV)
- [ ] Time tracking per card
- [ ] Webhooks for integrations
- [ ] Two-factor authentication

### 11.2 Scalability Roadmap
- [ ] Redis for session storage
- [ ] CDN for static assets
- [ ] Database sharding
- [ ] Horizontal scaling with load balancer
- [ ] Microservices architecture
- [ ] Elasticsearch for advanced search

---

## Document Version
- **Version**: 1.0
- **Last Updated**: November 8, 2024
- **Author**: FlowSpace Development Team
- **Status**: Production Ready

---

For questions or clarifications about this architecture, please refer to the README.md or contact the development team.
