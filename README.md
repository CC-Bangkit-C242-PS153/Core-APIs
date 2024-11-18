# Fitcal Backend

This repository contains the backend implementation and act as Core APIs for the Fitcal app.

## Project Description

The Fitcal backend is built using the JavaScript programming language, NodeJS Runtime, and HapiJS framework. It provides API endpoints for user-related operations. The backend utilizes Firebase Auth Token for authentication, and Firestore for database NoSQL.

## Getting Started

To get started with the Fitcal backend, follow these steps:

1. Clone the repository: `git clone https://github.com/CC-Bangkit-C242-PS153/Core-APIs.git`
2. Install the dependencies: `npm i`
3. Set up the environment variables by creating a `.env` file (refer to the .env section below).
4. Run the application: `npm run start` or `npm run start:dev` to using nodemon to run the server

Make sure Firebase and cloud services are on the same projects and use the service account key of Firebase  in the `.env` file to be able to validate Firebase idToken.

## Environment Variables

The following environment variables are required to run the Fitcal backend:

- `BUCKET_NAME`: Cloud Storage Bucket to Save Image.
- `SERVICE_ACCOUNT_KEY`: Key to be able to access Firebase services.

Make sure to set these variables in the `.env` file before running the application.

## Project Structure
```bash
├── README.md
├── .gitignore
├── package.json
├── package-lock.json
├── eslint.config.mjs
├── src
│   ├── exceptions
│   │   ├── ClientError.js
│   │   └── InputError.js
│   ├── server
│   │   ├── handler.js
│   │   ├── main.js
│   │   └── routes.js
│   └── services
│       ├── firebase.js
│       ├── pubsub.js
│       └── uploadImage.js
```
