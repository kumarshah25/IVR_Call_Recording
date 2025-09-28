# Lean Audio Recording & IVR Platform (MVP)

## Project Overview

This project is a Minimum Viable Product (MVP) of a lean audio recording and IVR platform. It allows users to upload a list of recipients, trigger outbound IVR calls, capture recordings, and view reports.

## Features

- **User Authentication:** Login via OTP (currently mocked with Firebase phone auth).
- **KYC Management:** Users can submit their KYC details (PAN, GST, Bank info).
- **Recipient Management:** Upload a CSV file of recipients.
- **Outbound IVR:** Mock implementation of an outbound IVR call flow.
- **File Storage:** Mock implementation of audio recording upload to Firebase Storage.
- **MIS Dashboard:** View statistics of calls and recordings, with charts.
- **Billing & Invoicing:** Mock implementation of billing and invoicing with Razorpay.

## Project Structure

```
IVR_Call_Recording/
├── backend/            # Node.js/Express backend
│   ├── data/
│   │   ├── ivr.db      # SQLite database
│   │   └── records.csv # Initial data for seeding the database
│   ├── index.js        # Main backend file
│   └── package.json
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── firebase/   # Firebase configuration and helper functions
│   │   ├── pages/      # React pages for different routes
│   │   ├── App.jsx     # Main App component with routing
│   │   └── main.jsx    # Entry point for the React app
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm installed.

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Start the backend server:
    ```bash
    npm start
    ```
    The backend will be running at `http://localhost:5000`.

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
    **Note:** There have been issues running `npm install` in this directory. If you face problems, you might need to troubleshoot the local setup.

3.  Start the frontend development server:
    ```bash
    npm start
    ```
    The frontend will be running at `http://localhost:5173`.

## Mock Implementations

- **IVR Flow:** The IVR call flow is mocked on the frontend in the `MockIVR.jsx` component. It does not make real phone calls.
- **Audio Recording:** The audio recording is a mock blob created and uploaded to Firebase Storage.
- **Payment Gateway:** The Razorpay payment flow is a mock. It does not process real payments.

## Important Notes

- **Firebase Configuration:** The Firebase configuration in `frontend/src/firebase/config.js` is using placeholder keys. You need to replace them with your own Firebase project configuration.
- **Razorpay Key:** In `frontend/src/pages/Invoices.jsx`, you need to replace `YOUR_RAZORPAY_KEY_ID` with your actual Razorpay Key ID.
