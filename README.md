# Resmi

This repository contains the source code of the Resmi project.

## Environment Variables

Create a `.env` file (not committed to version control) with the following variables:

- `MONGODB_URI` – MongoDB connection string.
- `ABUSEIPDB_KEY` – API key for AbuseIPDB.
- `SESSION_SECRET` – secret used to sign Express sessions.
- `PORT` – port on which the server runs (optional, defaults to `5000`).
- `RECAPTCHA_SECRET` – secret key for verifying Google reCAPTCHA.

An example configuration is provided in `.env.example`.

## Installation

1. Install dependencies:
   ```sh
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your values.

## Running the Server

After installing dependencies with `npm install`, start the server with:

```sh
npm start
```

This runs `node "madi resmi/server.js"`.
