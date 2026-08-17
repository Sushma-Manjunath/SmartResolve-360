# SmartResolve 360

SmartResolve 360 is a complaint management web application for submitting, tracking, and managing maintenance complaints.

## Features

- Complaint submission form
- Input validation
- Dynamic complaint display
- Complaint status management
- Technician assignment
- Search and filtering
- Responsive midnight-themed UI
- REST API integration
- Advanced Features
* Emergency detection center (auto-flags urgent complaints)
* Building digital map with room-level risk visualization
* Smart rule-based category/priority auto-detection while typing
* Voice-to-text complaint entry
* QR code scan demo for room selection
* Analytics dashboard (resolution rate, category breakdown)
* Multi-language support (English, Hindi, Kannada)

## Technologies

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- JSON

## Backend API

The backend provides REST API operations:

- GET - View complaints
- POST - Add a complaint
- PUT - Update a complaint
- DELETE - Delete a complaint

## How to Run

Open a terminal inside the `backend` folder and run:

```bash
npm install
node server.js
