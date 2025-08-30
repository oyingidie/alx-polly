# ALX-Polly

A modern, responsive polling application built with Next.js 15, TypeScript, Tailwind CSS, and Shadcn UI components.

## Features

- **User Authentication**: Login and registration system
- **Poll Management**: Create, view, and manage polls
- **Voting System**: Real-time voting with progress bars
- **Dashboard**: User dashboard with statistics and recent polls
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Beautiful components using Shadcn UI

## Project Structure

```
alx-polly/
├── app/                          # Next.js 15 app directory
│   ├── auth/                     # Authentication pages
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── polls/                   # Poll-related pages
│   │   ├── create/              # Create new poll
│   │   ├── [id]/                # Individual poll view
│   │   └── page.tsx             # All polls listing
│   ├── dashboard/               # User dashboard
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable components
│   ├── auth/                    # Authentication components
│   ├── layout/                  # Layout components
│   │   ├── navigation.tsx       # Navigation bar
│   │   ├── footer.tsx           # Footer component
│   │   └── main-layout.tsx      # Main layout wrapper
│   ├── polls/                   # Poll-specific components
│   └── ui/                      # Shadcn UI components
├── lib/                         # Utility libraries
│   ├── auth/                    # Authentication utilities
│   ├── db/                      # Database utilities
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # General utilities
├── public/                      # Static assets
└── package.json                 # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alx-polly
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **State Management**: React hooks (ready for external state management)
- **Authentication**: Placeholder system (ready for implementation)

## Key Components

### Authentication
- Login and registration forms
- Placeholder authentication logic
- Protected route structure

### Polls
- Poll creation form with dynamic options
- Poll listing with search and filtering
- Individual poll view with voting
- Real-time progress bars

### Dashboard
- User statistics overview
- Recent polls management
- Quick action buttons

## Development Notes

### Current Status
- ✅ Project structure scaffolded
- ✅ Shadcn UI components installed
- ✅ Basic pages created with placeholder data
- ✅ TypeScript types defined
- ✅ Responsive design implemented
- 🔄 Authentication system (placeholder)
- 🔄 Database integration (placeholder)
- 🔄 Form validation (to be implemented)

### Next Steps
1. Implement actual authentication system
2. Add database integration (e.g., Prisma + PostgreSQL)
3. Implement form validation with react-hook-form
4. Add real-time updates with WebSockets
5. Implement user authorization and permissions
6. Add search and filtering for polls
7. Implement analytics and reporting

### Placeholder Data
The app currently uses mock data for demonstration. Replace the placeholder functions in:
- `lib/auth/auth-utils.ts` - Authentication logic
- `lib/db/poll-utils.ts` - Database operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
