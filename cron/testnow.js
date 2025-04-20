const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client");
const moment = require("moment-timezone");

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pranavtavarej@gmail.com",
    pass: "achqpvryuhyncpfi", // Hardcoded app password (unsafe for public)
  },
});

const createMailOptions = (toEmail) => ({
  from: "Analytics Diary <pranavtavarej@gmail.com>",
  to: toEmail,
  subject: "📔 Your Analytics Diary is ready for today's entry!",
  text: "Your text version here...",
  html: "<p>Your HTML version here...</p>",
});

async function sendEmailsToAllUsers() {
  const now = moment().tz("Asia/Kolkata");
  const hour = now.hour();
  const minute = now.minute();

  const isInWindow =
    (hour > 18 && hour < 21) ||
    (hour === 18 && minute >= 0) ||
    (hour === 21 && minute <= 1);

  if (!isInWindow) {
    console.log("⏳ Not in time window (6:00 PM – 9:01 PM IST). Skipping email send.");
    return;
  }

  try {
    const users = await prisma.user.findMany();

    if (users.length === 0) {
      console.log("⚠ No users found in the database.");
      return;
    }

    for (const user of users) {
      const mailOptions = createMailOptions(user.email);
      await transporter.sendMail(mailOptions);
      console.log(`📩 Email sent to ${user.email}`);
    }

    console.log("✅ All emails sent.");
  } catch (error) {
    console.error("❌ Error sending emails:", error);
  }
}

sendEmailsToAllUsers();
