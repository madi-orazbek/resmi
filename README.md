# Resmi

This repository contains the source code of the Resmi project.

## Environment Variables

Create a `.env` file (not committed to version control) with the following variables:

- `MONGODB_URI` – MongoDB connection string.
- `ABUSEIPDB_KEY` – API key for AbuseIPDB.
- `SESSION_SECRET` – secret used to sign Express sessions.
- `PORT` – port on which the server runs (optional, defaults to `5000`).

An example configuration is provided in `.env.example`.
