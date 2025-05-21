# Blood Bank Management System

## Overview

This is a web-based blood bank management system designed to help blood banks track donors, recipients, blood inventory, and requests. The application follows a client-server architecture with a React frontend and Express backend. It uses Drizzle ORM for database operations with a PostgreSQL database, and integrates with Neon database for serverless Postgres capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React, TypeScript, and Vite. Key architectural choices include:

1. **Component Structure**: Uses a combination of page components and reusable UI components
2. **Styling**: Tailwind CSS for utility-first styling with shadcn/ui components
3. **State Management**: React Query for server state and context for authentication state
4. **Routing**: Wouter for lightweight client-side routing

The UI follows a consistent design system with components from the shadcn/ui library, which are built on top of Radix UI primitives. This provides accessibility and consistent styling across the application.

### Backend Architecture

The backend is built with Express and TypeScript. Key architectural choices include:

1. **API Design**: RESTful API structure
2. **Database Access**: Drizzle ORM for type-safe database operations
3. **Validation**: Zod for schema validation and TypeScript integration
4. **Authentication**: Simple authentication system (could be enhanced with JWT in production)

### Data Storage

The application uses PostgreSQL for data storage via Drizzle ORM. The database schema includes:

1. Users (authentication and access control)
2. Donors (blood donor information)
3. Recipients (blood recipient information)
4. Blood Inventory (blood units tracking)
5. Blood Requests (tracking blood requests from hospitals)
6. Donation Drives (organizing blood donation events)
7. Donations (tracking individual donation events)

### Authentication & Authorization

The system implements a role-based access control system with three primary roles:
- Admin: Full system access
- Staff: Day-to-day operations
- Hospital: Limited access for hospital personnel to request blood

## Key Components

### Client-side

1. **Pages**: Dashboard, Donors, Recipients, Inventory, Requests
2. **Components**: 
   - Layout components (Header, Sidebar)
   - Dashboard widgets (InventoryCard, ActivityTable, etc.)
   - Data tables for various entities
   - Form components for data entry

### Server-side

1. **API Routes**: Endpoints for all CRUD operations on the system entities
2. **Storage Layer**: Abstraction for database operations
3. **Authentication**: User login and session management
4. **Validation**: Request validation using Zod schemas

## Data Flow

1. **Authentication Flow**:
   - User submits credentials
   - Server validates credentials
   - Server returns user data
   - Client stores user data in context and localStorage
   - Protected routes check authentication state

2. **Data Retrieval Flow**:
   - Component renders and initiates query
   - React Query fetches data from API
   - Component displays data
   - Data is cached for future use

3. **Data Mutation Flow**:
   - User submits form
   - Client validates input with Zod
   - Request sent to API
   - Server validates request
   - Server updates database
   - Client updates local cache

## External Dependencies

### Frontend Dependencies

- React and React DOM
- Tanstack React Query
- Wouter (routing)
- Radix UI components
- Tailwind CSS
- Zod (validation)
- Lucide React (icons)
- date-fns (date formatting)

### Backend Dependencies

- Express
- Drizzle ORM
- @neondatabase/serverless
- Zod
- TypeScript

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

1. **Development Mode**:
   - `npm run dev` runs the Express server with Vite middleware for hot reloading
   - Server hosts both the API and serves the React application

2. **Production Build**:
   - Frontend is built with Vite
   - Backend is bundled with esbuild
   - Combined into a single deployment package

3. **Database**:
   - Uses PostgreSQL
   - Configured via environment variables
   - Supports schema migrations with Drizzle Kit

4. **Runtime Environment**:
   - Node.js 20
   - PostgreSQL 16
   - Web server (Express)

## Development Workflow

1. Use `npm run dev` to start the development server
2. API endpoints are available at `/api/*`
3. Frontend automatically refreshes when code changes
4. Database schema changes should be managed through Drizzle migrations
5. Run `npm run db:push` to apply schema changes to the database