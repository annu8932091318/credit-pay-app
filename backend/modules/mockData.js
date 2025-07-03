/**
 * This module provides mock data for when the MongoDB connection is not available.
 * It keeps the data in memory and provides CRUD functionality.
 */

// Mock data stores
let customers = [];
let sales = [];
let notifications = [];
let shopkeepers = [];
let receipts = [];

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Customer mock data functions
const customerFunctions = {
  find: () => {
    // Return an object with sort method that returns a promise
    return {
      sort: (sortOptions) => {
        // Make a copy of customers and sort them
        let sortedCustomers = [...customers];
        // Get the sort field and direction
        const sortField = Object.keys(sortOptions)[0];
        const sortDirection = sortOptions[sortField];
        
        // Sort the customers
        sortedCustomers.sort((a, b) => {
          if (!a[sortField] && !b[sortField]) return 0;
          if (!a[sortField]) return 1;
          if (!b[sortField]) return -1;
          
          if (sortDirection === 1 || sortDirection === 'asc') {
            return a[sortField] < b[sortField] ? -1 : 1;
          } else {
            return a[sortField] > b[sortField] ? -1 : 1;
          }
        });
        
        // Add toObject method to each customer
        sortedCustomers = sortedCustomers.map(customer => ({
          ...customer,
          toObject: function() { return this; }
        }));
        
        return Promise.resolve(sortedCustomers);
      }
    };
  },
  findById: (id) => {
    const customer = customers.find(c => c._id === id) || null;
    if (customer) {
      // Add toObject method
      customer.toObject = function() { return this; };
    }
    return Promise.resolve(customer);
  },
  create: (data) => {
    const newCustomer = { 
      ...data, 
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject: function() { return {...this}; }
    };
    customers.push(newCustomer);
    return Promise.resolve(newCustomer);
  },
  findByIdAndUpdate: (id, data) => {
    const index = customers.findIndex(c => c._id === id);
    if (index === -1) return Promise.resolve(null);
    
    customers[index] = { 
      ...customers[index], 
      ...data, 
      updatedAt: new Date() 
    };
    return Promise.resolve(customers[index]);
  },
  findByIdAndDelete: (id) => {
    const index = customers.findIndex(c => c._id === id);
    if (index === -1) return Promise.resolve(null);
    
    const deletedCustomer = customers[index];
    customers = customers.filter(c => c._id !== id);
    return Promise.resolve(deletedCustomer);
  }
};

// Sale mock data functions
const saleFunctions = {
  find: () => {
    // Return an object with sort method and populate method
    return {
      sort: (sortOptions) => {
        // Make a copy of sales and sort them
        let sortedSales = [...sales];
        // Get the sort field and direction
        const sortField = Object.keys(sortOptions)[0];
        const sortDirection = sortOptions[sortField];
        
        // Sort the sales
        sortedSales.sort((a, b) => {
          if (!a[sortField] && !b[sortField]) return 0;
          if (!a[sortField]) return 1;
          if (!b[sortField]) return -1;
          
          if (sortDirection === 1 || sortDirection === 'asc') {
            return a[sortField] < b[sortField] ? -1 : 1;
          } else {
            return a[sortField] > b[sortField] ? -1 : 1;
          }
        });
        
        // Add toObject method to each sale
        sortedSales = sortedSales.map(sale => ({
          ...sale,
          toObject: function() { return this; }
        }));
        
        return Promise.resolve(sortedSales);
      },
      populate: (field) => {
        // Make a copy of sales
        let populatedSales = [...sales];
        
        // For each sale, populate the customer field from the customers array
        populatedSales = populatedSales.map(sale => {
          const saleCopy = { ...sale };
          if (field === 'customer' && sale.customer) {
            const customer = customers.find(c => c._id === sale.customer);
            if (customer) {
              saleCopy.customer = { 
                ...customer,
                toObject: function() { return this; } 
              };
            }
          }
          saleCopy.toObject = function() { return this; };
          return saleCopy;
        });
        
        return {
          sort: (sortOptions) => {
            // Sort logic again after populate
            const sortField = Object.keys(sortOptions)[0];
            const sortDirection = sortOptions[sortField];
            
            populatedSales.sort((a, b) => {
              if (!a[sortField] && !b[sortField]) return 0;
              if (!a[sortField]) return 1;
              if (!b[sortField]) return -1;
              
              if (sortDirection === 1 || sortDirection === 'asc') {
                return a[sortField] < b[sortField] ? -1 : 1;
              } else {
                return a[sortField] > b[sortField] ? -1 : 1;
              }
            });
            
            return Promise.resolve(populatedSales);
          }
        };
      }
    };
  },
  findById: (id) => {
    const sale = sales.find(s => s._id === id) || null;
    if (sale) {
      // Add toObject method
      sale.toObject = function() { return this; };
    }
    return {
      populate: (field) => {
        if (!sale) return Promise.resolve(null);
        
        const saleCopy = { ...sale };
        if (field === 'customer' && saleCopy.customer) {
          const customer = customers.find(c => c._id === saleCopy.customer);
          if (customer) {
            saleCopy.customer = { 
              ...customer,
              toObject: function() { return this; } 
            };
          }
        }
        saleCopy.toObject = function() { return this; };
        return Promise.resolve(saleCopy);
      }
    };
  },
  create: (data) => {
    const newSale = { 
      ...data, 
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject: function() { return {...this}; }
    };
    sales.push(newSale);
    return Promise.resolve(newSale);
  },
  findByIdAndUpdate: (id, data) => {
    const index = sales.findIndex(s => s._id === id);
    if (index === -1) return Promise.resolve(null);
    
    sales[index] = { 
      ...sales[index], 
      ...data, 
      updatedAt: new Date() 
    };
    return Promise.resolve(sales[index]);
  },
  findByIdAndDelete: (id) => {
    const index = sales.findIndex(s => s._id === id);
    if (index === -1) return Promise.resolve(null);
    
    const deletedSale = sales[index];
    sales = sales.filter(s => s._id !== id);
    return Promise.resolve(deletedSale);
  }
};

// Notification mock data functions
const notificationFunctions = {
  find: () => {
    return {
      sort: (sortOptions) => {
        // Make a copy of notifications and sort them
        let sortedNotifications = [...notifications];
        // Get the sort field and direction
        const sortField = Object.keys(sortOptions)[0];
        const sortDirection = sortOptions[sortField];
        
        // Sort the notifications
        sortedNotifications.sort((a, b) => {
          if (!a[sortField] && !b[sortField]) return 0;
          if (!a[sortField]) return 1;
          if (!b[sortField]) return -1;
          
          if (sortDirection === 1 || sortDirection === 'asc') {
            return a[sortField] < b[sortField] ? -1 : 1;
          } else {
            return a[sortField] > b[sortField] ? -1 : 1;
          }
        });
        
        // Add toObject method to each notification
        sortedNotifications = sortedNotifications.map(notification => ({
          ...notification,
          toObject: function() { return this; }
        }));
        
        return Promise.resolve(sortedNotifications);
      },
      populate: (field) => {
        // Make a copy of notifications
        let populatedNotifications = [...notifications];
        
        // For each notification, populate the customer field from the customers array
        populatedNotifications = populatedNotifications.map(notification => {
          const notificationCopy = { ...notification };
          if (field === 'customer' && notification.customer) {
            const customer = customers.find(c => c._id === notification.customer);
            if (customer) {
              notificationCopy.customer = { 
                ...customer,
                toObject: function() { return this; } 
              };
            }
          }
          notificationCopy.toObject = function() { return this; };
          return notificationCopy;
        });
        
        return {
          sort: (sortOptions) => {
            // Sort logic again after populate
            const sortField = Object.keys(sortOptions)[0];
            const sortDirection = sortOptions[sortField];
            
            populatedNotifications.sort((a, b) => {
              if (!a[sortField] && !b[sortField]) return 0;
              if (!a[sortField]) return 1;
              if (!b[sortField]) return -1;
              
              if (sortDirection === 1 || sortDirection === 'asc') {
                return a[sortField] < b[sortField] ? -1 : 1;
              } else {
                return a[sortField] > b[sortField] ? -1 : 1;
              }
            });
            
            return Promise.resolve(populatedNotifications);
          }
        };
      }
    };
  },
  findById: (id) => {
    const notification = notifications.find(n => n._id === id) || null;
    if (notification) {
      // Add toObject method
      notification.toObject = function() { return this; };
    }
    return Promise.resolve(notification);
  },
  create: (data) => {
    const newNotification = { 
      ...data, 
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject: function() { return {...this}; }
    };
    notifications.push(newNotification);
    return Promise.resolve(newNotification);
  },
  findByIdAndUpdate: (id, data) => {
    const index = notifications.findIndex(n => n._id === id);
    if (index === -1) return Promise.resolve(null);
    
    notifications[index] = { 
      ...notifications[index], 
      ...data, 
      updatedAt: new Date() 
    };
    return Promise.resolve(notifications[index]);
  },
  findByIdAndDelete: (id) => {
    const index = notifications.findIndex(n => n._id === id);
    if (index === -1) return Promise.resolve(null);
    
    const deletedNotification = notifications[index];
    notifications = notifications.filter(n => n._id !== id);
    return Promise.resolve(deletedNotification);
  }
};

// Shopkeeper mock data functions
const shopkeeperFunctions = {
  find: () => Promise.resolve([...shopkeepers]),
  findById: (id) => Promise.resolve(shopkeepers.find(s => s._id === id) || null),
  create: (data) => {
    const newShopkeeper = { 
      ...data, 
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    shopkeepers.push(newShopkeeper);
    return Promise.resolve(newShopkeeper);
  },
  findByIdAndUpdate: (id, data) => {
    const index = shopkeepers.findIndex(s => s._id === id);
    if (index === -1) return Promise.resolve(null);
    
    shopkeepers[index] = { 
      ...shopkeepers[index], 
      ...data, 
      updatedAt: new Date() 
    };
    return Promise.resolve(shopkeepers[index]);
  },
  findByIdAndDelete: (id) => {
    const index = shopkeepers.findIndex(s => s._id === id);
    if (index === -1) return Promise.resolve(null);
    
    const deletedShopkeeper = shopkeepers[index];
    shopkeepers = shopkeepers.filter(s => s._id !== id);
    return Promise.resolve(deletedShopkeeper);
  }
};

// Receipt mock data functions
const receiptFunctions = {
  find: () => Promise.resolve([...receipts]),
  findById: (id) => Promise.resolve(receipts.find(r => r._id === id) || null),
  create: (data) => {
    const newReceipt = { 
      ...data, 
      _id: generateId(),
      receiptNumber: `RCP${Date.now().toString().substring(0, 10)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    receipts.push(newReceipt);
    return Promise.resolve(newReceipt);
  },
  findByIdAndUpdate: (id, data) => {
    const index = receipts.findIndex(r => r._id === id);
    if (index === -1) return Promise.resolve(null);
    
    receipts[index] = { 
      ...receipts[index], 
      ...data, 
      updatedAt: new Date() 
    };
    return Promise.resolve(receipts[index]);
  },
  findByIdAndDelete: (id) => {
    const index = receipts.findIndex(r => r._id === id);
    if (index === -1) return Promise.resolve(null);
    
    const deletedReceipt = receipts[index];
    receipts = receipts.filter(r => r._id !== id);
    return Promise.resolve(deletedReceipt);
  }
};

// Function to generate initial mock data
const generateMockData = () => {
  // Add some mock customers
  const customer1 = {
    _id: generateId(),
    name: "John Doe",
    phone: "9876543210",
    totalOwed: 500,
    lastTransactionDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const customer2 = {
    _id: generateId(),
    name: "Jane Smith",
    phone: "8765432109",
    totalOwed: 250,
    lastTransactionDate: new Date(Date.now() - 86400000), // 1 day ago
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  customers.push(customer1, customer2);
  
  // Add some mock sales
  const sale1 = {
    _id: generateId(),
    customer: customer1._id,
    amount: 500,
    status: "Pending",
    notes: "Grocery shopping",
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const sale2 = {
    _id: generateId(),
    customer: customer2._id,
    amount: 250,
    status: "Pending",
    notes: "Weekly vegetables",
    date: new Date(Date.now() - 86400000), // 1 day ago
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  sales.push(sale1, sale2);
  
  // Add a shopkeeper
  const shopkeeper = {
    _id: generateId(),
    shopName: "Local Grocery Store",
    phone: "1234567890",
    upiId: "shopkeeper@upi",
    whatsappNotifications: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  shopkeepers.push(shopkeeper);
  
  console.log("Mock data generated:", {
    customers: customers.length,
    sales: sales.length,
    shopkeepers: shopkeepers.length
  });
};

// Generate mock data on module load
generateMockData();

// Define the model interfaces
const Customer = {
  ...customerFunctions,
  model: {
    name: 'Customer',
  }
};

const Sale = {
  ...saleFunctions,
  model: {
    name: 'Sale',
  }
};

const Notification = {
  ...notificationFunctions,
  model: {
    name: 'Notification',
  }
};

const Shopkeeper = {
  ...shopkeeperFunctions,
  model: {
    name: 'Shopkeeper',
  }
};

const Receipt = {
  ...receiptFunctions,
  model: {
    name: 'Receipt',
  }
};

module.exports = {
  Customer,
  Sale,
  Notification,
  Shopkeeper,
  Receipt,
  isConnected: false
};
