# Media Explorer

A Finder-like web application for browsing directories and previewing media files (images, video, audio).

## Architecture

```
media-explorer/
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   └── routes/
│       ├── files.ts       # GET /api/files - directory listing
│       └── media.ts       # GET /api/media - file streaming with Range support
├── src/                    # React frontend
│   ├── api/               # API client and types
│   ├── components/        # UI components
│   │   ├── ui/           # Base components (Button, Switch, etc.)
│   │   ├── ControlBar.tsx
│   │   ├── FileList.tsx
│   │   ├── MediaPreview.tsx
│   │   ├── ThumbnailGrid.tsx
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Zustand state management
│   │   ├── explorerStore.ts   # Current path, selected file
│   │   └── settingsStore.ts   # Persisted user preferences
│   └── lib/               # Utilities
├── Dockerfile
└── docker-compose.yml
```

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Express, TypeScript
- **State**: Zustand with localStorage persistence

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/files?path=` | List directory contents |
| `GET /api/media?path=` | Stream media file (supports HTTP Range) |

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `MEDIA_ROOT` | Root directory for browsing (cannot navigate above) | `/media` |
| `PORT` | Server port | `3000` |

## Development

```bash
# Install dependencies
npm install

# Start dev server (frontend + backend with hot reload)
npm run dev
```

The app runs at `http://localhost:5173` with API proxy to the backend.

## Production

### Docker (Recommended)

```bash
# Build and run
docker-compose up --build

# Or with custom media directory
MEDIA_ROOT=/path/to/media docker-compose up --build
```

### Manual

```bash
# Build
npm run build

# Start production server
npm start
```

## Features

- **Two view modes**: List view with preview sidebar, Thumbnail grid
- **Media preview**: Images, video (with scrubber), audio
- **Auto-play**: Optional auto-play with loop for videos
- **Keyboard navigation**: Arrow keys to navigate files (toggleable)
- **Settings persistence**: Preferences saved to localStorage
