const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "EMAIL", 
      pass: "APP_PASSWORD"
    },      
  });

  await transporter.sendMail({
    from: `"DocMedaa" <EMAIL>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
