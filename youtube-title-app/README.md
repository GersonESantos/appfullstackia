# YouTube Title Fetcher

A simple React + Node.js application to fetch YouTube video titles using the oEmbed API.

## Prerequisites
- Node.js installed.

## Setup & Run

### 1. Server
Navigate to the `server` directory and start the backend:
```bash
cd server
npm install
node index.js
```
The server runs on `http://localhost:5000`.

### 2. Client
Open a new terminal, navigate to the `client` directory, and start the frontend:
```bash
cd client
npm install
npm run dev
```
The client runs on `http://localhost:5173`.

## Usage
1. Open `http://localhost:5173` in your browser.
2. Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`).
3. Click "Get Title".
4. The video title will be displayed.
