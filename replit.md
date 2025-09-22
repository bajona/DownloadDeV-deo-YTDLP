# replit.md

## Overview

This is a full-stack video downloader application built as a web interface for yt-dlp. The application provides a modern React frontend with a Node.js/Express backend, designed to download videos from various platforms through the yt-dlp command-line tool.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 24, 2025 - Privacy and Security Improvements
- Removed download history feature to protect user privacy
- Implemented automatic file deletion after download completion
- Added automatic cleanup of old files (1+ hour) to prevent disk space issues
- Enhanced filename detection for already downloaded files
- Fixed download file serving with proper error handling

### July 24, 2025 - Debugging and Fixes
- Fixed HTTP headers error in `/api/check-ytdlp` endpoint that was causing server crashes
- Resolved TypeScript compilation errors in frontend components with proper type definitions
- Installed yt-dlp system dependency and configured Python module execution
- Updated yt-dlp configuration with better options for avoiding platform blocks
- Successfully tested video downloads with Archive.org platform
- Application is now fully functional for video downloads from supported platforms

### Performance Optimizations (July 24, 2025)
- Optimized polling intervals to reduce unnecessary API calls
- Conditional command preview display to reduce UI clutter
- Implemented smart polling that stops when downloads complete
- Added download history with efficient caching
- Improved responsive design with better visual hierarchy
- Enhanced progress tracking with better UX indicators

### Privacy & Security Features
- No download history stored or shared between users
- Files automatically deleted after successful download
- Automatic cleanup of old files to prevent storage accumulation
- Each download session is completely private and temporary

### Known Limitations
- YouTube downloads may be blocked due to anti-bot measures (403 Forbidden errors)
- Some video platforms require specific configurations or may not be supported
- Archive.org and similar open platforms work reliably
- Download sessions are temporary and do not persist across server restarts

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

- **Frontend**: React-based single-page application built with Vite
- **Backend**: Express.js REST API server
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **UI Framework**: shadcn/ui components with Tailwind CSS styling
- **State Management**: TanStack React Query for server state management

## Key Components

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite for fast development
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack React Query for API state management and caching
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints with proper error handling and logging
- **Process Management**: Child process spawning for yt-dlp execution

### Database Schema
- **Downloads Table**: Tracks download requests with status, progress, and metadata
- **Users Table**: Basic user management (currently defined but not fully implemented)
- **Data Validation**: Drizzle-Zod integration for type-safe schema validation

## Data Flow

1. **User Interface**: Users input video URLs through the React frontend
2. **API Request**: Frontend sends download requests to Express backend
3. **Validation**: Backend validates input using Zod schemas
4. **Database Storage**: Download records are created and stored in PostgreSQL
5. **Process Execution**: Backend spawns yt-dlp child processes for actual downloading
6. **Real-time Updates**: Frontend polls for download status updates
7. **Progress Tracking**: Download progress is updated in the database and reflected in UI

## External Dependencies

### Core Dependencies
- **yt-dlp**: External command-line tool for video downloading (must be installed separately)
- **ffmpeg**: Required by yt-dlp for video processing
- **Neon Database**: Serverless PostgreSQL hosting service

### Key NPM Packages
- **Frontend**: React, Vite, TanStack React Query, Wouter, Radix UI, Tailwind CSS
- **Backend**: Express, Drizzle ORM, Zod validation
- **Development**: TypeScript, ESBuild for production builds

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Remote Neon Database connection
- **Asset Serving**: Vite handles static assets and proxy setup

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Deployment**: Single Node.js process serves both API and static files

### Configuration Requirements
- **DATABASE_URL**: PostgreSQL connection string (required)
- **Environment Variables**: Managed through process.env
- **External Tools**: yt-dlp and ffmpeg must be available in system PATH

### Key Architectural Decisions

1. **Monorepo Structure**: Frontend, backend, and shared code in single repository for simplified development
2. **Shared Schema**: Database schema and validation types shared between frontend and backend
3. **Memory Storage Fallback**: In-memory storage implementation for development/testing
4. **Process-based Downloads**: Uses child processes instead of library integration for yt-dlp flexibility
5. **Polling for Updates**: Frontend polls for download status rather than WebSocket implementation
6. **Component-first UI**: Heavy use of reusable UI components for consistent design