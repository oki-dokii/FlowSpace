const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Testing SMTP Configuration...\n');
console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***configured***' : 'NOT SET');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('\n❌ SMTP Connection Failed:');
    console.log(error);
  } else {
    console.log('\n✅ SMTP Server is ready to take our messages');
    
    // Try sending a test email
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: process.env.SMTP_EMAIL, // Send to self for testing
      subject: 'FlowSpace SMTP Test',
      html: `
        <h1>SMTP Configuration Test</h1>
        <p>This is a test email from FlowSpace application.</p>
        <p>If you receive this, your SMTP configuration is working correctly!</p>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('\n❌ Email Sending Failed:');
        console.log(err);
      } else {
        console.log('\n✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
      }
    });
  }
});
