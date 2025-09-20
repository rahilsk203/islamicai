# IslamicAI - Modern React Frontend

A fully modern and advanced frontend for the IslamicAI project built with React and Tailwind CSS.

## Features

- **Modern UI/UX Design**: Sleek, professional interface with Islamic aesthetics
- **Fully Responsive**: Works on all device sizes with mobile-first approach
- **Interactive Components**: 
  - Real-time chat interface with streaming message effects
  - Collapsible sidebar with quick navigation
  - Topic tags for easy access to Islamic subjects
  - Language selector for multilingual support
- **Performance Optimized**: Built with React for efficient rendering
- **Tailwind CSS**: Utility-first styling for consistent design system

## Component Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Navigation sidebar with recent chats and quick prompts
│   ├── ChatInterface.jsx    # Main chat interface with message display and input
│   └── MessageBubble.jsx    # Individual message bubbles with animations
├── utils/
│   └── api.js              # API utility functions for backend communication
├── App.jsx                 # Main application component
├── main.jsx               # Application entry point
├── index.css              # Global styles and Tailwind imports
└── App.css                # Component-specific styles
```

## Key Features Implemented

### 1. Modern Chat Interface
- Smooth message streaming animation
- Different styling for user vs AI messages
- Timestamps and sender identification
- Auto-scrolling to latest messages

### 2. Interactive Sidebar
- Recent chat history
- Quick prompt buttons
- Islamic topic tags
- Language selector
- About section with project information

### 3. Responsive Design
- Mobile-friendly layout with collapsible sidebar
- Adaptive input area with auto-resizing textarea
- Touch-friendly buttons and controls

### 4. Visual Enhancements
- Gradient accents with Islamic color scheme
- Smooth animations and transitions
- Custom scrollbar styling
- Welcome message with feature highlights

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Connecting to the Backend

To connect the frontend to the IslamicAI Cloudflare Worker backend:

1. Start the backend service (in the root islamicai directory):
   ```bash
   npm run dev
   ```
   This starts the backend on `http://127.0.0.1:8787`

2. Start the frontend (in the islamicai/islamicai directory):
   ```bash
   npm run dev
   ```

3. The frontend will automatically connect to the backend at `http://127.0.0.1:8787`

For detailed instructions, see [Backend Connection Guide](docs/backend-connection.md).

## Technical Details

- **Framework**: React 18 with hooks
- **Styling**: Tailwind CSS with custom configurations
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Inter and Merriweather)
- **Build Tool**: Vite

## Design Principles

- **Islamic Aesthetics**: Color scheme and design elements inspired by Islamic art
- **Accessibility**: Proper contrast ratios and semantic HTML
- **Performance**: Optimized components with React best practices
- **User Experience**: Intuitive navigation and clear visual hierarchy