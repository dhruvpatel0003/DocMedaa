const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ENTER_SENDER_EMAIL_HERE", 
      pass: "ENTER_SENDER_EMAIL_PASSWORD_HERE",
    },
  });

  await transporter.sendMail({
    from: `"DocMedaa" <ENTER_SENDER_EMAIL_HERE>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
