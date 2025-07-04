# Credit Pay App

A complete credit management application for small businesses to track customer credits and payments, featuring a professional and responsive UI in both light and dark modes.

## Tech Stack

### Frontend
- **Framework**: React (with React Router for navigation)
- **UI Library**: Material UI (MUI v5) with custom theming
- **State Management**: Context API + React Hooks
- **Styling**: MUI styled components, CSS, and dynamic theming

### Backend
- **Server**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT-based authentication
- **APIs**: RESTful API architecture

## Features

### User Management
- **Authentication**: Secure login with phone number and OTP
- **Registration**: New user signup with shop details
- **Profile Management**: View and edit personal and shop information

### Customer Management
- **Customer Directory**: View all customers with search and filtering
- **Customer Details**: Comprehensive view of individual customer records
- **Add Customer**: Register new customers with necessary details

### Credit Management
- **Add Sales**: Record new credit transactions with customer details
- **Sales History**: View all credit and payment transactions
- **Credit Reports**: Visual analytics on credit status

### Notifications
- **System Alerts**: Get notifications for important events
- **Payment Reminders**: Automatic reminders for overdue payments
- **Read/Unread Management**: Mark notifications as read/unread

### UI/UX Features
- **Responsive Design**: Works on all device sizes (mobile, tablet, desktop)
- **Theme Support**: Toggle between light and dark mode
- **Modern Interface**: Professional, clean UI with branded styles
- **Accessibility**: Keyboard navigation and screen reader support

## Components

### Navigation
- **Navbar**: Main navigation with responsive design
- **SidebarNav**: Collapsible sidebar for desktop navigation
- **Bottom Navigation**: Mobile-friendly navigation menu

### UI Elements
- **ThemeToggle**: Switch between light and dark modes
- **LoadingSpinner**: Visual feedback for loading states
- **ConfirmDialog**: Confirmation dialogs for important actions
- **NotificationSnackbar**: Toast messages for user feedback

### Pages
- **LoginPage**: User authentication with OTP
- **SignupPage**: New user registration
- **DashboardPage**: Overview of business metrics
- **CustomersPage**: Customer management interface
- **CustomerDetailPage**: Individual customer view
- **AddSalePage**: Record new credit transactions
- **SalesHistoryPage**: View transaction history
- **ProfilePage**: User profile management
- **NotificationsPage**: System and customer notifications
- **NotFoundPage**: 404 error page

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/credit-pay-app.git
   cd credit-pay-app
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Create environment variables (optional):
   ```
   # Backend (.env)
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/credit-pay
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   
   # Frontend (.env)
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Running with VS Code Tasks
The project includes VS Code tasks for quick startup:
- `Start Frontend`: Launches the React application
- `Start Backend`: Launches the Express server

## Project Structure

```
credit-pay-app/
├── backend/             # Express backend
│   ├── app.js           # App entry point
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── modules/         # Utility modules
│   └── scripts/         # Helper scripts
│
├── frontend/            # React frontend
│   ├── public/          # Static assets
│   └── src/             # React source files
│       ├── api/         # API request methods
│       ├── components/  # UI components
│       ├── contexts/    # React contexts
│       ├── pages/       # Page components
│       └── styles/      # Global styles
│
└── README.md            # Project documentation
```

## API Overview

The application features a comprehensive RESTful API:

- **Auth**: `/api/auth` - Authentication endpoints
- **Customers**: `/api/customers` - Customer management
- **Sales**: `/api/sales` - Credit and payment transactions
- **Shopkeepers**: `/api/shopkeepers` - Shop owner information
- **Notifications**: `/api/notifications` - System notifications

## Key Features

### Payment and Notifications
- **Automated Reminders**: Monthly payment reminders via SMS and WhatsApp
- **Payment Gateway**: Online payment collection through Razorpay
- **Real-time Payment Status**: Synchronization with backend
- **Receipt Generation**: PDF receipts for completed transactions

### Security & Performance
- **Full Backend Validation**: Data validation using express-validator
- **Security Headers**: Protection with helmet.js
- **Rate Limiting**: API protection against abuse
- **JWT Authentication**: Secure user authentication

### Enhanced UI/UX
- **Paytm-like Interface**: Professional payment experience
- **Color-coded Statuses**: Visual indicators for payment status
- **Responsive Design**: Works on all device sizes
- **Animation Effects**: Smooth transitions with framer-motion

## Future Enhancements
- **Inventory Integration**: Track inventory with credit sales
- **Multiple Users**: Support for shop employees with role-based access
- **Customer Portal**: Self-service portal for customers to view their credit
- **Advanced Analytics**: Business intelligence dashboards

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material-UI team for the excellent component library
- React team for the amazing frontend framework
- Express.js and MongoDB for powerful backend solutions
  ```

#### Update customer
- **URL**: `/api/customers/:id`
- **Method**: `PUT`
- **Description**: Updates a customer's information
- **Request Body**: 
  ```json
  {
    "name": "Priya Singh",
    "phone": "8765432109"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": {
      "_id": "6123456789abcdef12345679",
      "name": "Priya Singh",
      "phone": "8765432109",
      "totalOwed": 0,
      "createdAt": "2025-07-03T12:00:00Z",
      "updatedAt": "2025-07-03T12:30:00Z"
    }
  }
  ```

#### Delete customer
- **URL**: `/api/customers/:id`
- **Method**: `DELETE`
- **Description**: Deletes a customer
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Customer deleted",
    "data": {
      "message": "Customer deleted"
    }
  }
  ```

### Sales APIs

#### Get all sales
- **URL**: `/api/sales`
- **Method**: `GET`
- **Description**: Retrieves a list of all sales
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": [
      {
        "_id": "6123456789abcdef12345680",
        "customer": {
          "_id": "6123456789abcdef12345678",
          "name": "Rahul Sharma",
          "phone": "9876543210"
        },
        "amount": 2000,
        "status": "Pending",
        "notes": "Grocery items",
        "date": "2025-06-20T10:30:00Z",
        "createdAt": "2025-06-20T10:30:00Z",
        "updatedAt": "2025-06-20T10:30:00Z"
      }
    ]
  }
  ```

#### Get sale by ID
- **URL**: `/api/sales/:id`
- **Method**: `GET`
- **Description**: Retrieves a specific sale by ID
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": {
      "_id": "6123456789abcdef12345680",
      "customer": {
        "_id": "6123456789abcdef12345678",
        "name": "Rahul Sharma",
        "phone": "9876543210"
      },
      "amount": 2000,
      "status": "Pending",
      "notes": "Grocery items",
      "date": "2025-06-20T10:30:00Z",
      "createdAt": "2025-06-20T10:30:00Z",
      "updatedAt": "2025-06-20T10:30:00Z"
    }
  }
  ```

#### Create sale
- **URL**: `/api/sales`
- **Method**: `POST`
- **Description**: Creates a new sale
- **Request Body**: 
  ```json
  {
    "customer": "6123456789abcdef12345678",
    "amount": 2000,
    "status": "Pending",
    "notes": "Grocery items",
    "date": "2025-07-03T12:00:00Z"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": {
      "_id": "6123456789abcdef12345681",
      "customer": "6123456789abcdef12345678",
      "amount": 2000,
      "status": "Pending",
      "notes": "Grocery items",
      "date": "2025-07-03T12:00:00Z",
      "createdAt": "2025-07-03T12:00:00Z",
      "updatedAt": "2025-07-03T12:00:00Z"
    }
  }
  ```

#### Update sale
- **URL**: `/api/sales/:id`
- **Method**: `PUT`
- **Description**: Updates a sale
- **Request Body**: 
  ```json
  {
    "status": "Paid",
    "notes": "Grocery items - Paid in full"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": {
      "_id": "6123456789abcdef12345681",
      "customer": "6123456789abcdef12345678",
      "amount": 2000,
      "status": "Paid",
      "notes": "Grocery items - Paid in full",
      "date": "2025-07-03T12:00:00Z",
      "createdAt": "2025-07-03T12:00:00Z",
      "updatedAt": "2025-07-03T12:30:00Z"
    }
  }
  ```

#### Delete sale
- **URL**: `/api/sales/:id`
- **Method**: `DELETE`
- **Description**: Deletes a sale
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Sale deleted",
    "data": {
      "message": "Sale deleted"
    }
  }
  ```

### Notification APIs

#### Get all notifications
- **URL**: `/api/notifications`
- **Method**: `GET`
- **Description**: Retrieves a list of all notifications
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": [
      {
        "_id": "6123456789abcdef12345682",
        "customer": {
          "_id": "6123456789abcdef12345678",
          "name": "Rahul Sharma",
          "phone": "9876543210"
        },
        "message": "Your payment of ₹2000 is due today",
        "status": "SENT",
        "type": "PAYMENT_REMINDER",
        "channel": "whatsapp",
        "createdAt": "2025-07-01T09:00:00Z",
        "updatedAt": "2025-07-01T09:01:00Z"
      }
    ]
  }
  ```

#### Create notification
- **URL**: `/api/notifications`
- **Method**: `POST`
- **Description**: Creates a new notification
- **Request Body**: 
  ```json
  {
    "customer": "6123456789abcdef12345678",
    "message": "Your payment of ₹2000 is due today",
    "type": "PAYMENT_REMINDER",
    "channel": "whatsapp"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": {
      "_id": "6123456789abcdef12345683",
      "customer": "6123456789abcdef12345678",
      "message": "Your payment of ₹2000 is due today",
      "status": "PENDING",
      "type": "PAYMENT_REMINDER",
      "channel": "whatsapp",
      "createdAt": "2025-07-03T12:00:00Z",
      "updatedAt": "2025-07-03T12:00:00Z"
    }
  }
  ```

#### Update notification
- **URL**: `/api/notifications/:id`
- **Method**: `PUT`
- **Description**: Updates a notification
- **Request Body**: 
  ```json
  {
    "status": "SENT"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": {
      "_id": "6123456789abcdef12345683",
      "customer": "6123456789abcdef12345678",
      "message": "Your payment of ₹2000 is due today",
      "status": "SENT",
      "type": "PAYMENT_REMINDER",
      "channel": "whatsapp",
      "createdAt": "2025-07-03T12:00:00Z",
      "updatedAt": "2025-07-03T12:30:00Z"
    }
  }
  ```

#### Delete notification
- **URL**: `/api/notifications/:id`
- **Method**: `DELETE`
- **Description**: Deletes a notification
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Notification deleted",
    "data": {
      "message": "Notification deleted"
    }
  }
  ```

#### Send OTP
- **URL**: `/api/notifications/send-otp`
- **Method**: `POST`
- **Description**: Sends an OTP to a phone number
- **Request Body**: 
  ```json
  {
    "phone": "9876543210"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": {
      "message": "OTP sent successfully",
      "phone": "9876543210"
    }
  }
  ```

#### Verify OTP
- **URL**: `/api/notifications/verify-otp`
- **Method**: `POST`
- **Description**: Verifies an OTP sent to a phone number
- **Request Body**: 
  ```json
  {
    "phone": "9876543210",
    "otp": "1234"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": {
      "message": "OTP verified successfully",
      "phone": "9876543210"
    }
  }
  ```

### Shopkeeper APIs

#### Get all shopkeepers
- **URL**: `/api/shopkeepers`
- **Method**: `GET`
- **Description**: Retrieves a list of all shopkeepers
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": [
      {
        "_id": "6123456789abcdef12345684",
        "name": "Vikram Mehta",
        "phone": "9988776655",
        "email": "vikram@example.com",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ]
  }
  ```

#### Get shopkeeper by ID
- **URL**: `/api/shopkeepers/:id`
- **Method**: `GET`
- **Description**: Retrieves a specific shopkeeper by ID
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": {
      "_id": "6123456789abcdef12345684",
      "name": "Vikram Mehta",
      "phone": "9988776655",
      "email": "vikram@example.com",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  }
  ```

#### Create shopkeeper
- **URL**: `/api/shopkeepers`
- **Method**: `POST`
- **Description**: Creates a new shopkeeper
- **Request Body**: 
  ```json
  {
    "name": "Arjun Kumar",
    "phone": "8877665544",
    "email": "arjun@example.com"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": {
      "_id": "6123456789abcdef12345685",
      "name": "Arjun Kumar",
      "phone": "8877665544",
      "email": "arjun@example.com",
      "createdAt": "2025-07-03T12:00:00Z",
      "updatedAt": "2025-07-03T12:00:00Z"
    }
  }
  ```

#### Update shopkeeper
- **URL**: `/api/shopkeepers/:id`
- **Method**: `PUT`
- **Description**: Updates a shopkeeper's information
- **Request Body**: 
  ```json
  {
    "phone": "8877665555",
    "email": "arjun.kumar@example.com"
  }
  ```
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": {
      "_id": "6123456789abcdef12345685",
      "name": "Arjun Kumar",
      "phone": "8877665555",
      "email": "arjun.kumar@example.com",
      "createdAt": "2025-07-03T12:00:00Z",
      "updatedAt": "2025-07-03T12:30:00Z"
    }
  }
  ```

#### Delete shopkeeper
- **URL**: `/api/shopkeepers/:id`
- **Method**: `DELETE`
- **Description**: Deletes a shopkeeper
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Shopkeeper deleted",
    "data": {
      "message": "Shopkeeper deleted"
    }
  }
  ```

## Features

1. **Customer Management**
   - Add, edit and delete customers
   - View customer details with credit history

2. **Credit Management**
   - Record new credit sales
   - Track pending and paid transactions
   - Update payment status

3. **Dashboard**
   - Overview of total credit outstanding
   - Recent transactions
   - Customer statistics

4. **Notifications**
   - Send payment reminders
   - OTP verification for customer registration
   - Generate receipts

5. **Mobile Responsive**
   - Works seamlessly on mobile devices for on-the-go access
