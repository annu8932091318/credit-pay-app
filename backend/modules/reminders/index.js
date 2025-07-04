const cron = require('node-cron');
const twilio = require('twilio');
const Sale = require('../../models/sales');
const Customer = require('../../models/customers');
const Notification = require('../../models/notifications');

// Initialize Twilio client if credentials are available
let twilioClient;

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('Twilio client initialized successfully');
  } else {
    console.log('Twilio credentials missing. SMS and WhatsApp notifications will not work.');
  }
} catch (error) {
  console.error(`Failed to initialize Twilio client: ${error.message}`);
}

/**
 * Send SMS reminder using Twilio
 */
const sendSmsReminder = async (customer, sale) => {
  try {
    if (!twilioClient) {
      console.error('Cannot send SMS: Twilio client not initialized');
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }
    
    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.error('Cannot send SMS: Twilio phone number not configured');
      return {
        success: false,
        error: 'SMS service phone number not configured'
      };
    }

    const message = await twilioClient.messages.create({
      body: `Payment reminder: You have a pending payment of ₹${sale.amount} from ${new Date(sale.date).toLocaleDateString()}. Please clear your dues. Thank you!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${customer.phone}`
    });

    console.log(`SMS sent successfully to ${customer.phone}, SID: ${message.sid}`);
    
    return {
      success: true,
      sid: message.sid
    };
  } catch (error) {
    console.error(`Failed to send SMS to ${customer.phone}: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send WhatsApp reminder using Twilio's WhatsApp API
 */
const sendWhatsappReminder = async (customer, sale) => {
  try {
    if (!twilioClient) {
      console.error('Cannot send WhatsApp message: Twilio client not initialized');
      return {
        success: false,
        error: 'WhatsApp service not configured'
      };
    }

    if (!process.env.TWILIO_WHATSAPP_NUMBER) {
      console.error('Cannot send WhatsApp message: WhatsApp number not configured');
      return {
        success: false,
        error: 'WhatsApp service number not configured'
      };
    }

    const message = await twilioClient.messages.create({
      body: `Payment reminder: You have a pending payment of ₹${sale.amount} from ${new Date(sale.date).toLocaleDateString()}. Please clear your dues. Thank you!`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:+91${customer.whatsappNumber || customer.phone}`
    });

    console.log(`WhatsApp message sent successfully to ${customer.phone}, SID: ${message.sid}`);
    
    return {
      success: true,
      sid: message.sid
    };
  } catch (error) {
    console.error(`Failed to send WhatsApp message to ${customer.phone}: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update sale with reminder information
 */
const recordReminderSent = async (saleId, channel, status) => {
  try {
    const reminder = {
      sentAt: new Date(),
      channel,
      status: status ? 'SENT' : 'FAILED'
    };

    await Sale.findByIdAndUpdate(
      saleId,
      { $push: { reminders: reminder } }
    );

    return true;
  } catch (error) {
    console.error(`Failed to record reminder for sale ${saleId}: ${error.message}`);
    return false;
  }
};

/**
 * Create notification record
 */
const createNotificationRecord = async (customer, message, status, type, channel) => {
  try {
    const notification = new Notification({
      customer: customer._id,
      message,
      status,
      type,
      channel
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error(`Failed to create notification record: ${error.message}`);
    return null;
  }
};

/**
 * Process and send reminders for all overdue payments
 */
const processReminders = async () => {
  try {
    const currentDate = new Date();
    
    // Find all pending sales that are at least 30 days old
    const pendingSales = await Sale.find({
      status: 'PENDING',
      date: { $lte: new Date(currentDate - 30 * 24 * 60 * 60 * 1000) }
    }).populate('customer');

    console.log(`Found ${pendingSales.length} pending sales for reminders`);

    for (const sale of pendingSales) {
      const customer = sale.customer;
      
      if (!customer) {
        console.warn(`Customer not found for sale ${sale._id}`);
        continue;
      }

      let reminderSent = false;
      const reminderMessage = `Payment reminder: You have a pending payment of ₹${sale.amount} from ${new Date(sale.date).toLocaleDateString()}. Please clear your dues. Thank you!`;

      // Send reminder based on preferred contact method
      if (customer.preferredContactMethod === 'WHATSAPP' && (customer.whatsappNumber || customer.phone)) {
        const result = await sendWhatsappReminder(customer, sale);
        reminderSent = result.success;
        await recordReminderSent(sale._id, 'WHATSAPP', reminderSent);
        await createNotificationRecord(
          customer,
          reminderMessage,
          reminderSent ? 'SENT' : 'FAILED',
          'PAYMENT_REMINDER',
          'whatsapp'
        );
      } else if (customer.phone) {
        const result = await sendSmsReminder(customer, sale);
        reminderSent = result.success;
        await recordReminderSent(sale._id, 'SMS', reminderSent);
        await createNotificationRecord(
          customer,
          reminderMessage,
          reminderSent ? 'SENT' : 'FAILED',
          'PAYMENT_REMINDER',
          'sms'
        );
      }

      // Update sale status to OVERDUE if it's not already
      if (sale.status === 'PENDING') {
        await Sale.findByIdAndUpdate(sale._id, { status: 'OVERDUE' });
      }
    }

    console.log('Monthly payment reminder process completed');
  } catch (error) {
    console.error(`Error in processReminders: ${error.message}`);
  }
};

/**
 * Start the scheduler for monthly payment reminders
 */
const startReminderScheduler = () => {
  // Run at midnight on the 1st day of every month
  cron.schedule('0 0 1 * *', () => {
    console.log('Running monthly payment reminder scheduler');
    processReminders();
  });

  // For testing/development, uncomment to run every minute
  // cron.schedule('* * * * *', () => {
  //   console.log('Running test payment reminder scheduler (every minute)');
  //   processReminders();
  // });

  console.log('Payment reminder scheduler initialized');
};

// Manually trigger reminders (for testing or manual execution)
const triggerReminders = async () => {
  console.log('Manually triggering payment reminders');
  await processReminders();
  return { success: true, message: 'Reminders processed' };
};

module.exports = {
  startReminderScheduler,
  triggerReminders,
  sendSmsReminder,
  sendWhatsappReminder
};
