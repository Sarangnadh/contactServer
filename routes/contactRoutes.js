
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');

// Email Regex (basic validation)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// POST Contact Route
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, requirement } = req.body;

    // Validate
    if (!name || !email || !subject || !message || !requirement) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Save to DB
    const contact = new Contact({ name, email, subject, message, requirement });
    await contact.save();

    // Send mail to YOU
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact Request - ${subject}`,
      html: `
        <h3>New Contact Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Requirement:</strong> ${requirement}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    });

    // Send Confirmation mail to USER
    await transporter.sendMail({
      from: `"Sarang Nath" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting me!',
      html: `
        <h3>Hello ${name},</h3>
        <p>Thanks for reaching out! I’ve received your message regarding <b>${requirement}</b>.</p>
        <p>I’ll get back to you as soon as possible.</p>
        <br>
        <p>– Sarang Nath</p>
      `
    });

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
