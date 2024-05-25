const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config({ path: "../.env" });

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "onlyfornodejsapplication@gmail.com",
    pass: "eadz puka hexo ppvs",
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(userEmail, subject, content) {
  const email = userEmail;
  const emailSubject = subject;
  const emailContent = content;
  const mailOptions = {
    from: "onlyfornodejsapplication@gmail.com",
    to: email,
    subject: emailSubject,
    text: emailContent,
  };
  // send mail with defined transport object
  const info = await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
}

sendEmail().catch(console.error);


const generateToken = (userId) => {
  return jwt.sign(userId, process.env.JWT_SECRET, { expiresIn: '1d' });
};

module.exports = { generateToken, sendEmail };
