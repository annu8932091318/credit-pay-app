# Credit Pay App

A complete credit management application for small businesses to track customer credits and payments.

## Tech Stack

- **Frontend**: React with Material UI
- **Backend**: Express.js, MongoDB
- **Authentication**: JWT-based authentication (for admin/shopkeeper access)

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/credit-pay.git
   cd credit-pay
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

4. Create a `.env` file in the backend folder:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/credit-pay
   NODE_ENV=development
   ```

### Running the App

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

3. Access the app at http://localhost:3000

## API Documentation

### Customer APIs

#### Get all customers
- **URL**: `/api/customers`
- **Method**: `GET`
- **Description**: Retrieves a list of all customers
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": [
      {
        "_id": "6123456789abcdef12345678",
        "name": "Rahul Sharma",
        "phone": "9876543210",
        "totalOwed": 5000,
        "lastTransactionDate": "2025-06-20T10:30:00Z",
        "createdAt": "2025-01-10T12:00:00Z",
        "updatedAt": "2025-06-20T10:30:00Z"
      }
    ]
  }
  ```

#### Get customer by ID
- **URL**: `/api/customers/:id`
- **Method**: `GET`
- **Description**: Retrieves a specific customer by ID
- **Response**: 
  ```json
  {
    "status": "ok",
    "message": "Success",
    "data": {
      "_id": "6123456789abcdef12345678",
      "name": "Rahul Sharma",
      "phone": "9876543210",
      "totalOwed": 5000,
      "lastTransactionDate": "2025-06-20T10:30:00Z",
      "createdAt": "2025-01-10T12:00:00Z",
      "updatedAt": "2025-06-20T10:30:00Z"
    }
  }
  ```

#### Create customer
- **URL**: `/api/customers`
- **Method**: `POST`
- **Description**: Creates a new customer
- **Request Body**: 
  ```json
  {
    "name": "Priya Patel",
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
      "name": "Priya Patel",
      "phone": "8765432109",
      "totalOwed": 0,
      "createdAt": "2025-07-03T12:00:00Z",
      "updatedAt": "2025-07-03T12:00:00Z"
    }
  }
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
