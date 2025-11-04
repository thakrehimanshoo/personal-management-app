# Personal Management App

A web application for managing your ideas, subscriptions, and more.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: JSON file storage (temporary, will migrate to SQLite/PostgreSQL)
- **Authentication**: JWT-based sessions with bcrypt password hashing

## Project Structure

```
personal-management-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── ideas/
│   │   └── subscriptions/
│   ├── api/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/              # Reusable UI components
│   └── modules/         # Module-specific components
├── lib/
│   ├── db/
│   │   └── index.ts     # Database operations
│   └── auth/
│       ├── index.ts     # Auth utilities
│       └── session.ts   # Session management
├── data/                # JSON database files (auto-created)
│   ├── users.json
│   ├── ideas.json
│   └── subscriptions.json
└── prisma/
    └── schema.prisma    # Database schema (for future migration)
```

## Current Status

### ✅ Completed
- Project setup with Next.js, TypeScript, and Tailwind CSS
- Database schema design
- Simple JSON-based database for local development
- Authentication utilities (password hashing, user creation)
- Session management with JWT
- Landing page with login/register links

### 🚧 Next Steps
1. Create login and register pages
2. Build API routes for authentication
3. Create dashboard layout with navigation
4. Build Ideas Tracker module
5. Build Subscriptions Manager module
6. Add middleware for route protection
7. Migrate to proper database (SQLite/PostgreSQL)

## Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Database Models

### User
- id, email, passwordHash, name, createdAt, updatedAt

### Idea
- id, title, description, status, category, tags, createdAt, updatedAt, userId

### Subscription
- id, name, description, cost, currency, billingCycle, renewalDate, category, status, website, createdAt, updatedAt, userId

## Environment Variables

Create a `.env.local` file:
```
SESSION_SECRET=your-random-secret-key
```

## Future Enhancements

- Migration to SQLite (local) or PostgreSQL (cloud)
- 2FA authentication
- Email verification
- Password reset
- Export/import data
- Dark mode toggle
- Mobile responsive design optimization
- Additional mini-apps/modules
