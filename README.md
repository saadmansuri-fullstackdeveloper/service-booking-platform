# Service Booking Platform

A responsive booking experience for a fictional independent studio. This portfolio project demonstrates a React customer interface connected to an ASP.NET Core API.

## Features

- Browse service offerings and prices
- View sample appointment availability by date
- Create bookings through a validated API request
- Review bookings through a simple admin API route
- Responsive interface with booking confirmation

## Technology

React, TypeScript, and Vite · ASP.NET Core Minimal API on .NET 10 · in-memory sample data

## Run locally on Windows

Open two PowerShell terminals from the repository folder.

### Start the API

```powershell
cd api
dotnet run --urls http://localhost:5080
```

### Start the React app

```powershell
cd client
npm install
npm run dev
```

Open the address printed by Vite, usually `http://localhost:5173`.

## API routes

- `GET /api/health` — API status
- `GET /api/services` — sample service list
- `GET /api/availability?serviceId=consultation&date=2026-11-01` — sample time slots
- `POST /api/bookings` — create a booking
- `GET /api/admin/bookings` — list demo bookings

## Demo limitations

This is a portfolio demonstration, not a production booking system. Data is held in memory and resets when the API restarts. Authentication, persistent storage, email notifications, payments, and production scheduling rules are not implemented.

## Project status

MVP foundation. Planned improvements include SQL Server persistence, authenticated customer and staff workflows, and Azure deployment.
