# Go Tracer

Go Tracer is a static web application that detects stones in photographs of
19x19 Go boards and exports the detected position as an SGF file.

All image processing runs in the browser. The application has no backend or
persistent data store.

## Features

- Select a bundled example image
- Position four corner markers over the board
- Automatically classify intersections as black stones, white stones, or empty
- Preview the detected board position
- Inspect the color-space clustering used for detection
- Download the position as `game.sgf`

## Limitations

- The scanner always samples a 19x19 grid.
- The current interface only supports the bundled example images; it does not
  provide image upload or URL input.
- Detection quality depends on accurate corner placement, lighting, and a clear
  view of the board.

## Technology

- Vue 3
- Vite
- HTML Canvas
- JavaScript with TypeScript checking
- Firebase Hosting configuration for deployment

## Requirements

- Node.js 20.19+ or 22.12+
- pnpm 10
- A modern browser

## Local Development

Install dependencies and start the Vite development server:

```sh
pnpm install
pnpm run dev
```

The application is served at <http://localhost:3000>.

## Usage

1. Select one of the bundled example images.
2. Drag the four corner markers onto the outer intersections of the Go board.
3. Review the detected position and color plot.
4. Select **download** to save the position as `game.sgf`.

The SGF contains setup properties (`AB` and `AW`) for the detected stones; it
does not reconstruct move order.

## Checks

```sh
pnpm run lint
pnpm run typecheck
pnpm run build
```

There is currently no automated test suite.

## Firebase Preview

Build the application and serve it with the Firebase Hosting emulator:

```sh
pnpm run preview:firebase
```

The emulator serves the site at <http://localhost:5000>. Pushes to `master`
run linting, type checking, and a production build before deployment through
the Firebase Hosting GitHub Actions workflow.

## Project Structure

- `src/components/`: Vue interface components
- `src/lib/`: Board geometry, stone detection, SGF generation, and preview logic
- `src/styles/`: Application styles
- `public/images/`: UI assets and bundled example images
- `firebase.json`: Firebase Hosting and emulator configuration
- `.github/workflows/deploy-firebase.yml`: Production deployment workflow

Historical release notes for the original implementation are in
`CHANGELOG.txt`.
