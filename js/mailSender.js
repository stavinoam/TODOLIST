require("dotenv").config();
const nodemailer = require("nodemailer");
// User model
const User = require("../models/User.js");

const transporter = nodemailer.createTransport({
  service: "Hotmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

// Send verification email
const sendEmail = async (task, res) => {
  // url to be used in the mail
  const { email } = await User.findById({ _id: task.userId });
  // mail options
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: `Todo List Alert - ${task.name}`,
    html: `<p> Your task ${task.name} is incompleted.
    Due time for the task: ${task.dueDate} .</p>`,
  };
  //Send mail
  transporter
    .sendMail(mailOptions)
    .then(() => {
      console.log(`Mail sent to: ${email}, task name: ${task.name}`);
    })
    .catch((err) => {
      console.log(err);
      console.log(`Could not sent mail to: ${email}, task name: ${task.name}`);
    });
};

module.exports = { sendEmail };
