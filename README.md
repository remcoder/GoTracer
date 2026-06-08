# Go Tracer

A web application that scans images of Go boards and converts them to SGF (Smart Game Format) files.

## Features

- Upload or provide URL of a Go board image
- Position 4 corners on the board
- Automatic stone detection (black/white)
- Generates downloadable SGF file
- Visual feedback with color plot showing stone detection

## Technology Stack

- Backend: Python on Google App Engine
- Frontend: HTML5 Canvas, JavaScript
- Data Model: Google App Engine Datastore

## Requirements

- Modern browser (Firefox 3+, Safari 4+, Chrome 2+, Opera 10+)
- Google App Engine SDK for local development

## Usage

1. Enter URL of a Go board image
2. Position the 4 corners by dragging the crosshairs
3. Download the generated SGF file

## Project Structure

- `main.py`: Main request handler and application logic
- `models/trace.py`: Data model for storing board traces
- `templates/gotracer.html`: Main web interface
- `src/components/`: Vue interface components
- `src/lib/`: Core board scanning and visualization logic
- `src/styles/`: Application stylesheets
- `public/images/`: UI and sample images

## Version

v0.29 (Oct 29 2009)
