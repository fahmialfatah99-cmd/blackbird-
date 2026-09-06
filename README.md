# BluePin Messenger

Modern cross-platform messaging application inspired by BlackBerry Messenger with enhanced security and scalability.

## Tech Stack

### Frontend
- **Mobile**: React Native + Expo
- **Web**: React + Vite + TypeScript

### Backend
- **Supabase**
  - Authentication
  - PostgreSQL Database
  - Realtime subscriptions
  - Storage for avatars and media

### State Management
- Zustand

### Navigation
- React Router (Web)
- React Navigation (Mobile)

## Project Structure

```
bluepin-messenger/
├── apps/
│   ├── mobile/          # React Native Expo app
│   └── web/             # React web app
├── packages/
│   ├── api-client/      # Shared API client
│   ├── config/          # Shared configuration
│   ├── hooks/           # Shared React hooks
│   ├── types/           # Shared TypeScript types
│   ├── ui/              # Shared UI components
│   └── utils/           # Shared utilities
└── package.json         # Root package with workspaces
```

## Features

### Authentication
- Email/Username registration and login
- Password reset
- Persistent sessions
- Auto-generated BluePin ID (BP-XXXXXX format)

### Profile
- Avatar upload
- Display name, username, bio
- Personal status message
- Privacy settings
- QR code for adding contacts

### Contacts
- Search users by username or BluePin ID
- Send/receive contact requests
- Accept/reject/block contacts
- Contact list with presence indicators

### Messaging
- Real-time 1-on-1 chat
- Group chat with admin controls
- Message types: text, image
- Message status: sending, sent, delivered, read
- Typing indicators
- Reply and forward messages
- Edit/delete messages
- Read receipts

### Presence
- Online/offline status
- Last seen timestamp
- Real-time updates

### Additional Features
- Dark mode (default)
- Push notifications
- Archived conversations
- Mute conversations
- Global search
- PWA support (web)

## Setup Instructions

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Expo CLI (for mobile development)
- Supabase account

### Environment Variables

Create `.env` files in both `apps/web` and `apps/mobile`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Install all dependencies:
```bash
npm install
```

2. Set up Supabase database (see SQL migration scripts)

3. Run the applications:

**Web:**
```bash
npm run dev:web
```

**Mobile:**
```bash
npm run dev:mobile
```

## Database Schema

The application uses the following tables:
- profiles
- contacts
- conversations
- conversation_members
- messages
- message_receipts
- typing_indicators
- presence
- notifications

See `database/schema.sql` for complete schema and RLS policies.

## Development Phases

### Phase 1: Foundation
- [x] Project setup
- [ ] Authentication
- [ ] Profile management
- [ ] Database schema
- [ ] Main layout

### Phase 2: Core Messaging
- [ ] Contact system
- [ ] 1-on-1 chat
- [ ] Real-time messaging
- [ ] Read receipts

### Phase 3: Advanced Features
- [ ] Group chat
- [ ] Typing indicators
- [ ] Presence system
- [ ] Image uploads

### Phase 4: Polish
- [ ] Push notifications
- [ ] Privacy settings
- [ ] Archive/mute
- [ ] Search
- [ ] UI polish

## License

MIT
