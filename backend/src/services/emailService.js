// src/services/emailService.js
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/default');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Cache for email templates
    this.templates = {};
  }

  async loadTemplate(templateName) {
    if (this.templates[templateName]) {
      return this.templates[templateName];
    }

    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    this.templates[templateName] = handlebars.compile(templateContent);
    return this.templates[templateName];
  }

  async sendEmail(to, subject, template, data) {
    try {
      const compiledTemplate = await this.loadTemplate(template);
      const html = compiledTemplate(data);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Specific notification methods
  async sendTradeConfirmation(userEmail, tradeDetails) {
    await this.sendEmail(
      userEmail,
      `Trade Confirmation: ${tradeDetails.type} ${tradeDetails.symbol}`,
      'trade-confirmation',
      {
        ...tradeDetails,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      }
    );
  }

  async sendPriceAlert(userEmail, alertDetails) {
    await this.sendEmail(
      userEmail,
      `Price Alert: ${alertDetails.symbol}`,
      'price-alert',
      {
        ...alertDetails,
        time: new Date().toLocaleTimeString()
      }
    );
  }

  async sendPortfolioSummary(userEmail, portfolioDetails) {
    await this.sendEmail(
      userEmail,
      'Daily Portfolio Summary',
      'portfolio-summary',
      {
        ...portfolioDetails,
        date: new Date().toLocaleDateString()
      }
    );
  }
}

module.exports = new EmailService();