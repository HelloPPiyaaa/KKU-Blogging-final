const transporter = require('./transporter.js');
const resetPasswordTemplate = require('./templates/reset_password_template.js');
const path = require('path');

const logoPath = path.join(__dirname, './assets/logo-head.jpg');

const sendResetPasswordEmail = async (recipientEmail, recipientName, resetLink, referenceId) => {
  const mailOptions = {
    from: `no-reply <${process.env.MAIL_USER}>`,
    to: recipientEmail,
    subject: `[KKU Blogging] ตั้งค่ารหัสผ่านใหม่ รหัสอ้างอิง: (${referenceId})`,
    html: resetPasswordTemplate(recipientName, resetLink, referenceId),
    attachments: [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'logo'
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendResetPasswordEmail;