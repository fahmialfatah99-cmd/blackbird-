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

### Phase 1: Foundation ✅ COMPLETED
- [x] Project setup (Monorepo with Turborepo)
- [x] Authentication (Login, Register, Forgot Password)
- [x] Profile management (Auto-create on signup, update profile)
- [x] Database schema (9 tables with RLS, triggers, indexes)
- [x] Main layout (Dark blue-black theme)
- [x] Protected routes

### Phase 2: Core Messaging ✅ COMPLETED
- [x] Contact system (Search, send/accept/reject/block requests)
- [x] 1-on-1 chat (Real-time messaging with Supabase Realtime)
- [x] Read receipts (Delivered/Read status with checkmarks)
- [x] Chat list with last message preview
- [x] Presence indicators (Online/offline status)

### Phase 3: Advanced Features ✅ COMPLETED
- [x] Group chat (Create groups, add members, admin roles)
- [x] Typing indicators (Real-time typing status)
- [x] Presence system (PostgreSQL-based presence tracking)
- [x] Message timestamps and date grouping
- [x] Real-time subscriptions for messages, typing, and presence

### Phase 4: Polish 🚧 IN PROGRESS
- [ ] Push notifications
- [x] Privacy settings (show_last_seen, show_read_receipt, allow_messages_from_non_contacts)
- [ ] Archive/mute conversations
- [ ] Global search
- [x] UI polish (Responsive chat interface, hover effects)
- [ ] Mobile app implementation
- [ ] Image uploads and media sharing
- [ ] Message reply and forward
- [ ] Edit/delete messages
- [ ] QR code for adding contacts
- [ ] PWA support (web)

## Completed Features Summary

### ✅ Fully Implemented (Phases 1-3)

**Authentication & Profile:**
- Email/password registration with auto-generated BluePin ID (BP-XXXXXX)
- Login/logout with persistent sessions
- Password reset via email
- Profile creation on signup (trigger-based)
- Profile updates (display name, username, bio, status, privacy settings)
- Avatar upload to Supabase Storage

**Contacts:**
- Search users by username or BluePin ID
- Send contact requests
- Accept/reject pending requests
- Block/unblock contacts
- Remove contacts
- Contact list with profile details

**Conversations & Messaging:**
- Create direct conversations automatically when messaging a contact
- Create group conversations with multiple members
- Real-time messaging using Supabase Realtime
- Message status indicators (✓ for sent, ✓✓ for read)
- Typing indicators (... is typing)
- Online/offline presence indicators
- Message timestamps (Today, Yesterday, dates)
- Last message preview in chat list
- Unread message badges (UI ready)

**Database:**
- 9 tables with proper relationships
- Row Level Security (RLS) policies
- Automatic triggers for updated_at and profile creation
- Indexes for performance optimization
- Functions for BluePin ID generation

**UI/UX:**
- Dark blue-black theme (#0A0E1A background)
- Gradient text effects
- Responsive layouts
- Loading states with typing dot animation
- Error handling with alerts
- Protected routes with auth guards

## Getting Started

### Quick Start

1. **Setup Supabase:**
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Run SQL from `database/schema.sql` in SQL Editor
   - Create storage buckets: `avatars`, `images`

2. **Configure Environment:**
   ```bash
   # apps/web/.env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # apps/mobile/.env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Install & Run:**
   ```bash
   npm install
   npm run dev:web    # Web app at http://localhost:5173
   npm run dev:mobile # Mobile app with Expo
   ```

### Testing the App

1. Register a new account
2. Complete your profile
3. Add contacts using username or BluePin ID
4. Start chatting with real-time messages
5. Create groups and invite members
6. See typing indicators and presence updates

## Tech Stack

### Frontend
- **Web**: React 18 + Vite + TypeScript
- **Mobile**: React Native + Expo (coming soon)

### Backend
- **Supabase**
  - PostgreSQL Database
  - Authentication (Email/Password)
  - Realtime subscriptions
  - Storage (Avatars, Images)
  - Row Level Security

### State Management
- Zustand (lightweight, hooks-based)

### Navigation
- React Router v6 (Web)
- React Navigation (Mobile - planned)

### Styling
- CSS Variables (theme colors)
- Inline styles for dynamic values
- Custom component classes

## API Client

The `@bluepin/api-client` package provides a complete Supabase client with methods for:

- **Auth**: register, login, logout, resetPassword, getSession
- **Profiles**: getProfile, updateProfile, searchProfiles
- **Contacts**: getContacts, sendContactRequest, accept/reject/block
- **Conversations**: create/get conversations, add/remove members
- **Messages**: send, get, edit, delete messages
- **Receipts**: mark messages as read
- **Presence**: update and get online status
- **Typing**: update typing indicators
- **Storage**: upload avatars and images
- **Realtime**: subscribe to messages, typing, presence

## Project Structure

```
bluepin-messenger/
├── apps/
│   ├── web/                    # React web application
│   │   ├── src/
│   │   │   ├── features/       # Feature modules
│   │   │   │   ├── auth/       # Login, Register, ForgotPassword
│   │   │   │   ├── contacts/   # ContactList, AddContact
│   │   │   │   ├── conversations/ # ChatList, Conversation
│   │   │   │   ├── groups/     # CreateGroup
│   │   │   │   └── profile/    # Profile settings
│   │   │   ├── store/          # Zustand stores
│   │   │   ├── lib/            # API client instance
│   │   │   └── App.tsx         # Main app with routing
│   │   └── .env                # Environment variables
│   └── mobile/                 # React Native app (planned)
├── packages/
│   ├── api-client/             # Supabase API client
│   └── types/                  # Shared TypeScript types
├── database/
│   └── schema.sql              # Database schema & RLS
└── README.md
```

## Database Tables

| Table | Description |
|-------|-------------|
| profiles | User profiles with BluePin ID |
| contacts | Contact relationships |
| conversations | Direct & group conversations |
| conversation_members | Members of each conversation |
| messages | All messages with type support |
| message_receipts | Read/delivered status |
| typing_indicators | Real-time typing status |
| presence | Online/offline status |
| notifications | Push notification queue |

## Next Steps (Phase 4)

1. **Push Notifications**: Integrate with Supabase Edge Functions
2. **Archive/Mute**: Add conversation management features
3. **Global Search**: Search across messages and contacts
4. **Mobile App**: Implement React Native version
5. **Media Sharing**: Image upload and preview
6. **Message Actions**: Reply, forward, edit, delete
7. **QR Codes**: Generate QR for easy contact adding
8. **PWA**: Add service worker for offline support

## License

MIT
