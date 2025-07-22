require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
const generatePDF = require('./utils/generatePDF.js');
const User = require('./models/User');
const Order = require('./models/Order.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OAuth2 Client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// === GOOGLE OAUTH ===
app.get('/auth/google', (req, res) => {
  const qs = querystring.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${qs}`);
});


app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({ googleId, name, email, picture });
    }
    res.redirect(`http://localhost:5173?userName=${encodeURIComponent(name)}&picture=${encodeURIComponent(picture)}&googleId=${googleId}`);

  } catch (err) {
    console.error('OAuth Error:', err);
    res.status(500).json({ error: 'OAuth failed', details: err.message });
  }
});

// === LOCAL AUTH ===
app.post('/auth/local/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const localId = `local-${username.toLowerCase()}`;

  try {
    let user = await User.findOne({ localId });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    user = await User.create({
      localId,
      username,
      name: username,
      email,
      password, // In production: use bcrypt hash!
      picture: 'https://via.placeholder.com/100',
    });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed', details: err.message });
  }
});

app.post('/auth/local/login', async (req, res) => {
  const { username, password } = req.body;
  const localId = `local-${username.toLowerCase()}`;

  try {
    const user = await User.findOne({ localId });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// === ORDER ENDPOINT + OTP EMAIL ===
app.post('/order', async (req, res) => {
  const { googleId, localId, items, total } = req.body;

  if ((!googleId && !localId) || !items?.length || !total) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    const user = await User.findOne(googleId ? { googleId } : { localId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 min

    const order = await Order.create({
      googleId: user.googleId || null,
      items,
      total,
      otp,
      otpExpires,
      status: 'pending'
    });

    const pdfPath = await generatePDF(order, user);

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MenuApp 🍽️" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Your MenuApp OTP & Receipt',
      html: `
        <h3>Hi ${user.name},</h3>
        <p>Thanks for your order! Here's your OTP to confirm:</p>
        <h2 style="color:#1877f2;">${otp}</h2>
        <p>This OTP is valid for 10 minutes.</p>
        <hr/>
        <p>We've also attached your PDF receipt.</p>
      `,
      attachments: [
        {
          filename: `receipt-${order._id}.pdf`,
          path: pdfPath,
        },
      ],
    });

    fs.unlinkSync(pdfPath);

    res.json({ message: 'Order placed. OTP emailed.', orderId: order._id });
  } catch (err) {
    console.error('Order/Email Error:', err);
    res.status(500).json({ error: 'Failed to place order', details: err.message });
  }
});


// === ORDER CONFIRMATION ===
app.post('/order/confirm', async (req, res) => {
  const { orderId, otp } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.otp !== otp || Date.now() > order.otpExpires) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    order.otp = null;
    order.otpExpires = null;
    order.status = 'confirmed';
    await order.save();

    res.json({ message: 'Order confirmed. Receipt sent.', orderId: order._id });
  } catch (err) {
    console.error('OTP confirm error:', err);
    res.status(500).json({ error: 'Failed to confirm order', details: err.message });
  }
});

app.get('/test-email', (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  transporter.sendMail({
    from: `"Test" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: 'Test Email',
    text: 'This is a test email.',
  }, (err, info) => {
    if (err) {
      console.error('Test Email Error:', err);
      res.status(500).json({ error: err.message });
    } else {
      console.log('Test Email sent:', info.response);
      res.json({ message: 'Test email sent', info });
    }
  });
});
 
// === MongoDB Connection ===
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server at http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ Mongo error:', err.message));