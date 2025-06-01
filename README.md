# E-Voting System

A demo-grade prototype to simulate a secure, blockchain-based voting system that includes basic user authentication and a tamper-resistant local vote log.

## Project Overview

The system allows pre-registered voters to log in with a password and cast a vote for a candidate. Votes are stored as blocks in a custom JavaScript blockchain implementation. The blockchain is stored in memory or in a local file. Admins can start and end elections, manage candidates, and view the blockchain vote log.

## Architecture

- **Frontend**: React (Vite) + Tailwind CSS + React Router
- **Backend**: Express.js (Node.js)
- **Database**: MongoDB (local instance), using Mongoose ODM
- **Blockchain**: Pure JavaScript blockchain module (custom-built)

## Features

### Identity Verification (Simplified)
- Password-based login
- Passwords are securely hashed using bcrypt
- JWT token authentication

### Admin Capabilities
- Start an election
- End an election
- Add and remove candidates
- View the blockchain ledger (real-time vote log)

### Voter Flow
- Voter is pre-registered with a unique voterId and password
- Logs in using credentials
- Can vote only once per election
- Each vote becomes a new block in the blockchain

### Blockchain Design
- Each block contains:
  - Hashed Voter ID
  - Candidate ID
  - Timestamp
  - Previous block's hash
  - Current block's hash
- Blocks are added sequentially
- Chain is validated using the hashes
- All data is stored locally

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local instance)

### Installation

1. Clone the repository

2. Install dependencies for the server:
   ```
   cd server
   npm install
   ```

3. Install dependencies for the client:
   ```
   cd client
   npm install
   ```

4. Start MongoDB locally:
   ```
   mongod --dbpath=./data
   ```

5. Seed the database with initial data:
   ```
   cd server
   npm run seed
   ```

6. Start the server:
   ```
   cd server
   npm start
   ```

7. Start the client:
   ```
   cd client
   npm run dev
   ```

8. Access the application at `http://localhost:5173`

## Default Credentials

### Admin
- ID: admin123
- Password: admin123

### Voters
- ID: voter1
  Password: voter123
- ID: voter2
  Password: voter123
- ID: voter3
  Password: voter123

## Project Structure

```
evoting-system/
├── client/                # React + Vite frontend
│   ├── pages/             # Login, Vote, Admin Dashboard
│   └── components/        # Form fields, Candidate cards
├── server/                # Express.js backend
│   ├── models/            # Mongoose schemas: Voter, Candidate, Election
│   ├── routes/            # Auth, Admin, Voting routes
│   ├── controllers/       # Auth logic, blockchain interaction
│   └── blockchain/        # Custom JS blockchain module
└── README.md
```

## Note

This project is demo-grade, not for production. All operations work offline with no reliance on external services.