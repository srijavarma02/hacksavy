// Real SMS/WhatsApp notification service using Twilio
import twilio from 'twilio';

class NotificationService {
  constructor() {
    // Initialize Twilio client if credentials are available
    this.useTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    
    if (this.useTwilio) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.twilioPhone = process.env.TWILIO_PHONE_NUMBER;
      this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
      console.log('✅ Twilio initialized - Real SMS/WhatsApp enabled');
    } else {
      console.log('⚠️  Twilio not configured - Using mock notifications');
    }
    
    this.notificationLog = [];
    this.rateLimits = new Map(); // Track last notification time per building
    this.cooldownPeriod = 15 * 60 * 1000; // 15 minutes cooldown
    
    // SMS pause/resume control
    this.smsPaused = true; // Start paused by default
    
    // IMPORTANT: Replace with your real phone numbers for demo
    this.blockManagers = {
      1: { name: 'Your Name', phone: '+918008584156', email: 'you@campus.edu' },
      2: { name: 'Building Manager 2', phone: '+918008584156', email: 'manager2@campus.edu' },
      3: { name: 'Building Manager 3', phone: '+918008584156', email: 'manager3@campus.edu' },
      4: { name: 'Building Manager 4', phone: '+918008584156', email: 'manager4@campus.edu' },
      5: { name: 'Building Manager 5', phone: '+918008584156', email: 'manager5@campus.edu' },
      6: { name: 'Building Manager 6', phone: '+918008584156', email: 'manager6@campus.edu' },
      7: { name: 'Building Manager 7', phone: '+918008584156', email: 'manager7@campus.edu' }
    };
    
    // Wastage thresholds per block (percentage over baseline)
    this.wastageThresholds = {
      default: 20, // 20% over baseline triggers alert
      critical: 30 // 30% triggers immediate escalation
    };
  }
  
  // Check if we can send notification (rate limiting)
  canSendNotification(buildingId) {
    const lastSent = this.rateLimits.get(buildingId);
    if (!lastSent) return true;
    
    const timeSince = Date.now() - lastSent;
    return timeSince > this.cooldownPeriod;
  }
  
  // Pause SMS sending
  pauseSMS() {
    this.smsPaused = true;
    console.log('📵 SMS notifications PAUSED');
  }
  
  // Resume SMS sending
  resumeSMS() {
    this.smsPaused = false;
    console.log('📱 SMS notifications RESUMED');
  }
  
  // Check if SMS is paused
  isSMSPaused() {
    return this.smsPaused;
  }

  // Check if wastage exceeds threshold
  checkWastageThreshold(buildingId, actual, baseline) {
    const wastagePercent = ((actual - baseline) / baseline) * 100;
    
    if (wastagePercent > this.wastageThresholds.critical) {
      return { shouldNotify: true, severity: 'critical', wastagePercent };
    } else if (wastagePercent > this.wastageThresholds.default) {
      return { shouldNotify: true, severity: 'warning', wastagePercent };
    }
    
    return { shouldNotify: false, wastagePercent };
  }

  // Send SMS notification (real via Twilio or mock)
  async sendSMS(buildingId, wastageData) {
    // Check if SMS is paused
    if (this.smsPaused) {
      console.log(`📵 SMS PAUSED: Skipping notification for building ${buildingId}`);
      return null;
    }
    
    const manager = this.blockManagers[buildingId];
    if (!manager) return null;

    // Check rate limit
    if (!this.canSendNotification(buildingId)) {
      console.log(`⏳ Rate limit: Skipping SMS for building ${buildingId}`);
      return null;
    }

    const message = this.formatWastageMessage(wastageData);
    
    // Send real SMS via Twilio if configured
    if (this.useTwilio) {
      try {
        const result = await this.client.messages.create({
          body: message,
          from: this.twilioPhone,
          to: manager.phone
        });
        
        console.log(`✅ SMS sent successfully to ${manager.phone}: ${result.sid}`);
        
        const notification = {
          id: result.sid,
          channel: 'sms',
          recipient: manager.name,
          phone: manager.phone,
          message,
          timestamp: new Date().toLocaleString(),
          status: 'sent',
          buildingId,
          twilioSid: result.sid
        };
        
        this.notificationLog.unshift(notification);
        this.rateLimits.set(buildingId, Date.now());
        return notification;
        
      } catch (error) {
        console.error(`❌ SMS failed to ${manager.phone}:`, error.message);
        
        const notification = {
          id: Date.now(),
          channel: 'sms',
          recipient: manager.name,
          phone: manager.phone,
          message,
          timestamp: new Date().toLocaleString(),
          status: 'failed',
          buildingId,
          error: error.message
        };
        
        this.notificationLog.unshift(notification);
        return notification;
      }
    } else {
      // Mock SMS sending
      console.log(`📱 [MOCK] SMS to ${manager.phone}: ${message}`);
      
      const notification = {
        id: Date.now(),
        channel: 'sms',
        recipient: manager.name,
        phone: manager.phone,
        message,
        timestamp: new Date().toLocaleString(),
        status: 'sent',
        buildingId,
        mock: true
      };
      
      this.notificationLog.unshift(notification);
      this.rateLimits.set(buildingId, Date.now());
      return notification;
    }
  }

  // Send WhatsApp notification (real via Twilio or mock)
  async sendWhatsApp(buildingId, wastageData) {
    const manager = this.blockManagers[buildingId];
    if (!manager) return null;

    // Check rate limit
    if (!this.canSendNotification(buildingId)) {
      console.log(`⏳ Rate limit: Skipping WhatsApp for building ${buildingId}`);
      return null;
    }

    const message = this.formatWastageMessage(wastageData);
    
    // Send real WhatsApp via Twilio if configured
    if (this.useTwilio) {
      try {
        const result = await this.client.messages.create({
          body: message,
          from: this.whatsappNumber,
          to: `whatsapp:${manager.phone}`
        });
        
        console.log(`✅ WhatsApp sent successfully to ${manager.phone}: ${result.sid}`);
        
        const notification = {
          id: result.sid,
          channel: 'whatsapp',
          recipient: manager.name,
          phone: manager.phone,
          message,
          timestamp: new Date().toLocaleString(),
          status: 'sent',
          buildingId,
          twilioSid: result.sid
        };
        
        this.notificationLog.unshift(notification);
        this.rateLimits.set(buildingId, Date.now());
        return notification;
        
      } catch (error) {
        console.error(`❌ WhatsApp failed to ${manager.phone}:`, error.message);
        
        const notification = {
          id: Date.now() + 1,
          channel: 'whatsapp',
          recipient: manager.name,
          phone: manager.phone,
          message,
          timestamp: new Date().toLocaleString(),
          status: 'failed',
          buildingId,
          error: error.message
        };
        
        this.notificationLog.unshift(notification);
        return notification;
      }
    } else {
      // Mock WhatsApp sending
      console.log(`💬 [MOCK] WhatsApp to ${manager.phone}: ${message}`);
      
      const notification = {
        id: Date.now() + 1,
        channel: 'whatsapp',
        recipient: manager.name,
        phone: manager.phone,
        message,
        timestamp: new Date().toLocaleString(),
        status: 'sent',
        buildingId,
        mock: true
      };
      
      this.notificationLog.unshift(notification);
      this.rateLimits.set(buildingId, Date.now());
      return notification;
    }
  }

  // Format wastage alert message
  formatWastageMessage(wastageData) {
    const { buildingName, wastagePercent, actualKwh, baselineKwh, severity } = wastageData;
    const emoji = severity === 'critical' ? '🚨🚨' : '⚠️';
    const dashboardLink = 'https://campus.edu/energy'; // Mock short link
    
    return `${emoji} High wastage in ${buildingName}: ${wastagePercent.toFixed(1)}% over baseline (${actualKwh.toFixed(1)} kWh vs ${baselineKwh.toFixed(1)} kWh baseline). Check HVAC/lighting systems. Dashboard: ${dashboardLink}`;
  }

  // Send HVAC fault alert
  async sendHVACAlert(buildingId, faultData) {
    const manager = this.blockManagers[buildingId];
    if (!manager) return null;

    // Check rate limit
    if (!this.canSendNotification(buildingId)) {
      console.log(`⏳ Rate limit: Skipping HVAC alert for building ${buildingId}`);
      return null;
    }

    const message = `🔧 HVAC Alert - ${faultData.buildingName}: ${faultData.message}. ${faultData.recommendation}`;
    
    // Send real SMS via Twilio if configured
    if (this.useTwilio) {
      try {
        const result = await this.client.messages.create({
          body: message,
          from: this.twilioPhone,
          to: manager.phone
        });
        
        console.log(`✅ HVAC alert sent to ${manager.phone}: ${result.sid}`);
        
        const notification = {
          id: result.sid,
          channel: 'sms',
          recipient: manager.name,
          phone: manager.phone,
          message,
          timestamp: new Date().toLocaleString(),
          status: 'sent',
          buildingId,
          type: 'hvac_fault',
          twilioSid: result.sid
        };
        
        this.notificationLog.unshift(notification);
        this.rateLimits.set(buildingId, Date.now());
        return notification;
        
      } catch (error) {
        console.error(`❌ HVAC alert failed to ${manager.phone}:`, error.message);
        return null;
      }
    } else {
      // Mock HVAC alert
      console.log(`📱 [MOCK] SMS to ${manager.phone}: ${message}`);
      
      const notification = {
        id: Date.now(),
        channel: 'sms',
        recipient: manager.name,
        phone: manager.phone,
        message,
        timestamp: new Date().toLocaleString(),
        status: 'sent',
        buildingId,
        type: 'hvac_fault',
        mock: true
      };
      
      this.notificationLog.unshift(notification);
      this.rateLimits.set(buildingId, Date.now());
      return notification;
    }
  }

  // Get notification log
  getNotificationLog(limit = 50) {
    return this.notificationLog.slice(0, limit);
  }

  // Clear old notifications (keep last 100)
  cleanupLog() {
    if (this.notificationLog.length > 100) {
      this.notificationLog = this.notificationLog.slice(0, 100);
    }
  }
}

export default new NotificationService();
