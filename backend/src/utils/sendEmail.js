const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "practice0003@gmail.com", 
      pass: "zrdtrjdmgtrtljkr"
    },    
  });

  await transporter.sendMail({
    from: `"DocMedaa" <practice0003@gmail.com>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
