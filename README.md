# Padel Club Management

A modern, minimalist frontend MVP for managing padel club players. This dashboard provides administrators with powerful filtering capabilities to manage thousands of players efficiently.

## Features

- **Player Rating Filter**: Range selector from 0 to 10 for filtering players by skill level
- **Name Search**: Filter by first name and second name
- **Age Filter**: Min/Max age range selection
- **Preference Hours**: Multi-select filter for finding players by their available playing hours
- **Add Player Button**: Placeholder for future functionality (currently disabled)
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, minimalist interface focused on usability

## Getting Started

### Prerequisites

- Node.js (v20.x or higher recommended)
- npm

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
padel-club/
├── src/
│   ├── App.jsx          # Main dashboard component
│   ├── App.css          # Dashboard styles
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## Tech Stack

- **React 18**: Modern UI library
- **Vite**: Fast build tool and dev server
- **CSS3**: Custom styling with CSS variables
- **ES6+**: Modern JavaScript features

## Future Enhancements

- Backend API integration
- User authentication
- Player data table with pagination
- Add/Edit/Delete player functionality
- Advanced filtering and sorting options
- Export functionality
- Analytics and reporting
