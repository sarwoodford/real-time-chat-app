# Real-Time Chat Application

## Project Overview
The Real-Time Chat Application is a feature-complete web application built with Node.js, Express, MongoDB, and EJS. It allows users to register, log in, and communicate with each other in real-time via a chat interface. The application also includes an admin dashboard for managing users.

### Key Features
- User registration and authentication
- Real-time messaging using WebSockets
- User profiles with join dates
- Online user status display
- Admin dashboard for user management

## Technology Stack
- **Frontend**: EJS, HTML, CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Real-Time Communication**: WebSockets via `express-ws`
- **Security**: Password hashing with `bcrypt`

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- MongoDB (local or Atlas instance)

### Clone the Repository
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

### Install Dependencies
```bash
npm install
```

### Configure Environment Variables
Create a `.env` file in the root directory and add the following environment variables:
```
MONGO_URI=<your_mongodb_connection_string>
SESSION_SECRET=<your_session_secret>
```

### Run the Application
```bash
npm start
```
The application will start and be accessible at `http://localhost:3000`.

## Usage

1. **Register**: Navigate to the home page to register a new account.
2. **Log In**: After registration, log in to access the chat.
3. **Chat**: Send messages in real-time. Users will see notifications when a new user joins the chat.
4. **Profile**: Access your profile page to view your information.

## Admin Dashboard
Administrators can view all registered users and manage them through the admin dashboard. Access to this feature requires admin credentials.

## Testing
- Ensure to write unit and integration tests for your components.
- Run tests using Jest (or any other testing framework you choose).

## License

This project is provided for **personal use only**. Redistribution, modification, or commercial use in any form is strictly prohibited without prior written permission from the author.

For detailed license terms, refer to the [LICENSE](./LICENSE.md) file.


## Authors
- **[Nasser-A-Ali](https://github.com/Nasser-A-Ali)** 
- **[sarwoodford](https://github.com/sarwoodford)** 
- **[SearchingSteve](https://github.com/SearchingSteve)** 
