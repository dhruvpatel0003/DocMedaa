const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "EMAIL", 
      pass: "PASS"
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
