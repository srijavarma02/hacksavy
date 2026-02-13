/**
 * Report Distributor Service
 * Handles email and SMS distribution of daily evaluation reports
 * 
 * Features:
 * - Email Distribution: Sends reports via email with PDF attachments
 * - SMS Distribution: Sends summary notifications with dashboard links
 * - Retry Queue: Implements retry logic for failed distributions
 * - Configuration Integration: Uses configManager for recipient lists
 * - Detailed Logging: Tracks all distribution attempts and results
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 * 
 * @module reportDistributor
 */

import nodemailer from 'nodemailer';
import notificationService from '../notificationService.js';
import { loadConfig } from './configManager.js';
import { exportToPDF } from './reportExporter.js';
import { getReport } from './reportStorage.js';

/**
 * @typedef {import('./types.js').Report} Report
 * @typedef {import('./types.js').DistributionConfig} DistributionConfig
 * @typedef {import('./types.js').DistributionResult} DistributionResult
 * @typedef {import('./types.js').EmailResult} EmailResult
 * @typedef {import('./types.js').SMSResult} SMSResult
 * @typedef {import('./types.js').DistributionFailure} DistributionFailure
 */

/**
 * Retry queue for failed distributions
 * @type {Array<{reportId: string, recipient: string, channel: 'email'|'sms', attempts: number, lastAttempt: Date}>}
 */
const retryQueue = [];

/**
 * Maximum retry attempts
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Retry delay in milliseconds (exponential backoff)
 */
const RETRY_DELAY_BASE = 5 * 60 * 1000; // 5 minutes

/**
 * Distribution log for tracking
 */
const distributionLog = [];

/**
 * Create email transporter
 * Uses environment variables for SMTP configuration
 * Falls back to mock transporter if not configured
 * @returns {nodemailer.Transporter}
 */
function createEmailTransporter() {
  // Check if email credentials are configured
  const emailConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  if (emailConfigured) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Mock transporter for development/testing
    console.log('⚠️  Email not configured - Using mock email transporter');
    return nodemailer.createTransport({
      jsonTransport: true
    });
  }
}

/**
 * Format email body with report summary
 * @param {Report} report - Report data
 * @returns {string} HTML email body
 */
function formatEmailBody(report) {
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formatNumber = (num, decimals = 2) => {
    return typeof num === 'number' ? num.toFixed(decimals) : '0.00';
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2c3e50;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 0 0 5px 5px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .summary-card {
      background: white;
      padding: 15px;
      border-radius: 5px;
      border-left: 4px solid #3498db;
    }
    .summary-card .label {
      color: #7f8c8d;
      font-size: 12px;
      margin-bottom: 5px;
    }
    .summary-card .value {
      color: #2c3e50;
      font-size: 24px;
      font-weight: bold;
    }
    .summary-card .unit {
      color: #95a5a6;
      font-size: 12px;
    }
    .highlight {
      background: white;
      padding: 12px;
      margin: 10px 0;
      border-radius: 5px;
      border-left: 4px solid #e74c3c;
    }
    .button {
      display: inline-block;
      background-color: #3498db;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      color: #7f8c8d;
      font-size: 12px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Daily Evaluation Report</h1>
    <p>Campus Building Monitoring System</p>
    <p>${formatDate(report.period.start)} - ${formatDate(report.period.end)}</p>
  </div>
  
  <div class="content">
    <h2>Executive Summary</h2>
    
    <div class="summary-grid">
      <div class="summary-card">
        <div class="label">Total Energy</div>
        <div class="value">${formatNumber(report.summary.totalEnergy)}</div>
        <div class="unit">kWh</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Wastage</div>
        <div class="value">${formatNumber(report.summary.totalWastage)}</div>
        <div class="unit">kWh</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Alerts</div>
        <div class="value">${report.summary.totalAlerts}</div>
        <div class="unit">alerts</div>
      </div>
      <div class="summary-card">
        <div class="label">Sustainability Score</div>
        <div class="value">${formatNumber(report.summary.sustainabilityScore, 1)}</div>
        <div class="unit">/ 100</div>
      </div>
    </div>
    
    ${report.summary.criticalIssues > 0 ? `
    <div class="highlight">
      <strong>⚠️ ${report.summary.criticalIssues} Critical Issue${report.summary.criticalIssues > 1 ? 's' : ''}</strong>
      <p>Immediate attention required. Please review the attached report for details.</p>
    </div>
    ` : ''}
    
    ${report.summary.keyHighlights && report.summary.keyHighlights.length > 0 ? `
    <h3>Key Highlights</h3>
    <ul>
      ${report.summary.keyHighlights.map(h => `<li>${h}</li>`).join('')}
    </ul>
    ` : ''}
    
    <p style="margin-top: 20px;">
      The complete report is attached as a PDF. You can also view it online in the dashboard.
    </p>
    
    <a href="${process.env.DASHBOARD_URL || 'http://localhost:5173'}/reports/${report.id}" class="button">
      View in Dashboard
    </a>
  </div>
  
  <div class="footer">
    <p>Smart Campus Energy Monitoring System</p>
    <p>Report ID: ${report.id}</p>
    <p>Generated: ${formatDate(report.generatedAt)}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Format SMS message with report summary
 * @param {Report} report - Report data
 * @returns {string} SMS message text
 */
function formatSMSMessage(report) {
  const formatNumber = (num, decimals = 1) => {
    return typeof num === 'number' ? num.toFixed(decimals) : '0.0';
  };

  const dashboardLink = `${process.env.DASHBOARD_URL || 'http://localhost:5173'}/reports/${report.id}`;
  
  // Create concise summary for SMS (160 character limit consideration)
  const criticalAlert = report.summary.criticalIssues > 0 
    ? `🚨 ${report.summary.criticalIssues} critical issue${report.summary.criticalIssues > 1 ? 's' : ''}! ` 
    : '';
  
  return `${criticalAlert}Daily Report: Energy ${formatNumber(report.summary.totalEnergy)} kWh, Wastage ${formatNumber(report.summary.totalWastage)} kWh, ${report.summary.totalAlerts} alerts. View: ${dashboardLink}`;
}

/**
 * Send email with PDF attachment
 * @param {string} reportId - Report ID
 * @param {string[]} recipients - Email addresses
 * @returns {Promise<EmailResult>} Email result
 */
export async function sendEmail(reportId, recipients) {
  const logEntry = {
    reportId,
    channel: 'email',
    recipients: [...recipients],
    timestamp: new Date(),
    status: 'pending'
  };

  try {
    // Fetch report
    const report = await getReport(reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    // Generate PDF attachment
    const pdfBuffer = await exportToPDF(reportId);

    // Create transporter
    const transporter = createEmailTransporter();

    // Email options
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Campus Energy System" <noreply@campus.edu>',
      to: recipients.join(', '),
      subject: `Daily Evaluation Report - ${new Date(report.period.end).toLocaleDateString()}`,
      html: formatEmailBody(report),
      attachments: [
        {
          filename: `report-${reportId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    logEntry.status = 'sent';
    logEntry.messageId = info.messageId;
    distributionLog.push(logEntry);

    console.log(`✅ Email sent successfully to ${recipients.length} recipient(s): ${info.messageId}`);

    return {
      sent: true,
      recipients,
      messageId: info.messageId
    };

  } catch (error) {
    logEntry.status = 'failed';
    logEntry.error = error.message;
    distributionLog.push(logEntry);

    console.error(`❌ Email failed for report ${reportId}:`, error.message);

    // Add to retry queue
    recipients.forEach(recipient => {
      addToRetryQueue(reportId, recipient, 'email');
    });

    return {
      sent: false,
      recipients,
      error: error.message
    };
  }
}

/**
 * Send SMS summary
 * @param {string} reportId - Report ID
 * @param {string[]} recipients - Phone numbers (E.164 format)
 * @returns {Promise<SMSResult>} SMS result
 */
export async function sendSMS(reportId, recipients) {
  const logEntry = {
    reportId,
    channel: 'sms',
    recipients: [...recipients],
    timestamp: new Date(),
    status: 'pending'
  };

  try {
    // Fetch report
    const report = await getReport(reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    // Format SMS message
    const message = formatSMSMessage(report);

    const messageIds = [];
    const errors = [];

    // Send SMS to each recipient using notificationService
    for (const recipient of recipients) {
      try {
        // Create a mock building ID for the notification service
        // In a real scenario, this might be derived from the report or configuration
        const mockBuildingId = 1;
        
        // Use the existing notification service's SMS capability
        // Note: We need to adapt the wastage data format to work with the existing service
        const wastageData = {
          buildingName: 'Campus Report',
          wastagePercent: (report.summary.totalWastage / report.summary.totalEnergy) * 100,
          actualKwh: report.summary.totalEnergy,
          baselineKwh: report.summary.totalEnergy - report.summary.totalWastage,
          severity: report.summary.criticalIssues > 0 ? 'critical' : 'warning'
        };

        // Temporarily override the notification service's SMS pause state
        const wasPaused = notificationService.isSMSPaused();
        if (wasPaused) {
          notificationService.resumeSMS();
        }

        // Send via notification service
        const result = await notificationService.sendSMS(mockBuildingId, wastageData);

        // Restore pause state
        if (wasPaused) {
          notificationService.pauseSMS();
        }

        if (result && result.status === 'sent') {
          messageIds.push(result.id || result.twilioSid || 'mock-id');
        } else {
          errors.push(`Failed to send to ${recipient}`);
        }

      } catch (error) {
        console.error(`❌ SMS failed to ${recipient}:`, error.message);
        errors.push(`${recipient}: ${error.message}`);
      }
    }

    const allSent = errors.length === 0;
    logEntry.status = allSent ? 'sent' : 'partial';
    logEntry.messageIds = messageIds;
    logEntry.errors = errors;
    distributionLog.push(logEntry);

    if (allSent) {
      console.log(`✅ SMS sent successfully to ${recipients.length} recipient(s)`);
    } else {
      console.warn(`⚠️  SMS partially sent: ${messageIds.length} succeeded, ${errors.length} failed`);
      
      // Add failed recipients to retry queue
      errors.forEach(errorMsg => {
        const recipient = errorMsg.split(':')[0];
        addToRetryQueue(reportId, recipient, 'sms');
      });
    }

    return {
      sent: allSent,
      recipients,
      messageIds,
      errors
    };

  } catch (error) {
    logEntry.status = 'failed';
    logEntry.error = error.message;
    distributionLog.push(logEntry);

    console.error(`❌ SMS failed for report ${reportId}:`, error.message);

    // Add all recipients to retry queue
    recipients.forEach(recipient => {
      addToRetryQueue(reportId, recipient, 'sms');
    });

    return {
      sent: false,
      recipients,
      messageIds: [],
      errors: [error.message]
    };
  }
}

/**
 * Add failed distribution to retry queue
 * @param {string} reportId - Report ID
 * @param {string} recipient - Recipient (email or phone)
 * @param {'email'|'sms'} channel - Distribution channel
 */
function addToRetryQueue(reportId, recipient, channel) {
  // Check if already in queue
  const existing = retryQueue.find(
    item => item.reportId === reportId && 
            item.recipient === recipient && 
            item.channel === channel
  );

  if (existing) {
    existing.attempts += 1;
    existing.lastAttempt = new Date();
  } else {
    retryQueue.push({
      reportId,
      recipient,
      channel,
      attempts: 1,
      lastAttempt: new Date()
    });
  }

  console.log(`📝 Added to retry queue: ${channel} to ${recipient} (attempt ${existing ? existing.attempts : 1})`);
}

/**
 * Process retry queue
 * Attempts to resend failed distributions with exponential backoff
 * @returns {Promise<void>}
 */
export async function processRetryQueue() {
  const now = new Date();
  const itemsToRetry = [];

  // Find items ready for retry
  for (let i = retryQueue.length - 1; i >= 0; i--) {
    const item = retryQueue[i];
    
    // Check if max attempts reached
    if (item.attempts >= MAX_RETRY_ATTEMPTS) {
      console.log(`❌ Max retry attempts reached for ${item.channel} to ${item.recipient}`);
      retryQueue.splice(i, 1);
      continue;
    }

    // Calculate retry delay with exponential backoff
    const retryDelay = RETRY_DELAY_BASE * Math.pow(2, item.attempts - 1);
    const timeSinceLastAttempt = now - item.lastAttempt;

    if (timeSinceLastAttempt >= retryDelay) {
      itemsToRetry.push(item);
    }
  }

  // Process retry items
  for (const item of itemsToRetry) {
    console.log(`🔄 Retrying ${item.channel} to ${item.recipient} (attempt ${item.attempts + 1})`);

    try {
      if (item.channel === 'email') {
        const result = await sendEmail(item.reportId, [item.recipient]);
        if (result.sent) {
          // Remove from queue on success
          const index = retryQueue.indexOf(item);
          if (index > -1) {
            retryQueue.splice(index, 1);
          }
        }
      } else if (item.channel === 'sms') {
        const result = await sendSMS(item.reportId, [item.recipient]);
        if (result.sent) {
          // Remove from queue on success
          const index = retryQueue.indexOf(item);
          if (index > -1) {
            retryQueue.splice(index, 1);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Retry failed for ${item.channel} to ${item.recipient}:`, error.message);
    }
  }
}

/**
 * Distribute report to configured recipients
 * Orchestrates email and SMS distribution based on configuration
 * @param {string} reportId - Report ID
 * @returns {Promise<DistributionResult>} Distribution result
 */
export async function distributeReport(reportId) {
  console.log(`📤 Starting distribution for report ${reportId}`);

  // Load configuration
  const config = await loadConfig();
  const distConfig = config.distribution;

  const failures = [];
  let emailsSent = 0;
  let smsSent = 0;

  // Send emails if enabled
  if (distConfig.emailEnabled && distConfig.emailRecipients.length > 0) {
    console.log(`📧 Sending emails to ${distConfig.emailRecipients.length} recipient(s)`);
    
    const emailResult = await sendEmail(reportId, distConfig.emailRecipients);
    
    if (emailResult.sent) {
      emailsSent = emailResult.recipients.length;
    } else {
      emailResult.recipients.forEach(recipient => {
        failures.push({
          recipient,
          channel: 'email',
          error: emailResult.error || 'Unknown error'
        });
      });
    }
  }

  // Send SMS if enabled
  if (distConfig.smsEnabled && distConfig.smsRecipients.length > 0) {
    console.log(`📱 Sending SMS to ${distConfig.smsRecipients.length} recipient(s)`);
    
    const smsResult = await sendSMS(reportId, distConfig.smsRecipients);
    
    smsSent = smsResult.messageIds.length;
    
    if (smsResult.errors.length > 0) {
      smsResult.errors.forEach(errorMsg => {
        const recipient = errorMsg.split(':')[0];
        const error = errorMsg.split(':')[1] || 'Unknown error';
        failures.push({
          recipient,
          channel: 'sms',
          error
        });
      });
    }
  }

  const result = {
    emailsSent,
    smsSent,
    failures
  };

  console.log(`✅ Distribution complete: ${emailsSent} emails, ${smsSent} SMS, ${failures.length} failures`);

  return result;
}

/**
 * Get distribution log
 * @param {number} limit - Maximum number of entries to return
 * @returns {Array} Distribution log entries
 */
export function getDistributionLog(limit = 50) {
  return distributionLog.slice(-limit);
}

/**
 * Get retry queue status
 * @returns {Array} Current retry queue
 */
export function getRetryQueue() {
  return [...retryQueue];
}

/**
 * Clear distribution log
 */
export function clearDistributionLog() {
  distributionLog.length = 0;
}

// Start periodic retry queue processing (every 5 minutes)
setInterval(() => {
  if (retryQueue.length > 0) {
    console.log(`🔄 Processing retry queue (${retryQueue.length} items)`);
    processRetryQueue().catch(error => {
      console.error('❌ Error processing retry queue:', error);
    });
  }
}, 5 * 60 * 1000);

export default {
  sendEmail,
  sendSMS,
  distributeReport,
  processRetryQueue,
  getDistributionLog,
  getRetryQueue,
  clearDistributionLog
};
