const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client");
const moment = require("moment-timezone");

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pranavtavarej@gmail.com",
    pass: "achqpvryuhyncpfi", // App password
  },
});

const createMailOptions = (toEmail) => ({
  from: "Analytics Diary <pranavtavarej@gmail.com>",
  to: toEmail,
  subject: "📔 Your Analytics Diary is ready for today's entry!",
  text: `Good morning!

It's a fresh start — the perfect time to reflect, plan, and track your progress. Your Analytics Diary is ready for today's entry.

Start writing now 👉 https://diary-analy.vercel.app/

Why log your day?
• Stay consistent with your habits
• Track your productivity & mindset
• Build self-awareness over time

Just a few minutes each day can make a big difference. 💪

Let’s make today meaningful — you’ve got this!

Cheers,
The Analytics Diary Team
`,
  html: `
    <p>Good morning!</p>
    <p>It’s a fresh start — the perfect time to reflect, plan, and track your progress. Your Analytics Diary is ready for today’s entry.</p>

    <p>🖊 <strong>Start writing now:</strong><br>
    👉 <a href="https://diary-analy.vercel.app/" target="_blank" style="color:#1a73e8; font-weight:bold;">Log Today’s Entry</a></p>

    <h3>Why log your day?</h3>
    <ul>
      <li>Stay consistent with your habits</li>
      <li>Track your productivity & mindset</li>
      <li>Build self-awareness over time</li>
    </ul>

    <p>Just a few minutes each day can make a big difference. 💪</p>

    <p>Let’s make today meaningful — you’ve got this!</p>

    <p>Cheers,<br>
    The Analytics Diary Team</p>
  `,
});

let lastSentDate = null;

async function sendEmailsToAllUsers() {
  console.log("🚀 Sending daily reminder emails...");

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

    console.log("✅ All reminder emails sent successfully.");
  } catch (error) {
    console.error("❌ Error sending emails:", error);
  }
}

// 🔁 Check every 30 seconds between 6:00 and 6:15 AM IST
setInterval(async () => {
  const now = moment().tz("Asia/Kolkata");
  const hour = now.hour();
  const minute = now.minute();
  const today = now.format("YYYY-MM-DD");

  const isInWindow = (hour === 6 && minute >= 0 && minute <= 15);
  const alreadySentToday = lastSentDate === today;

  if (isInWindow && !alreadySentToday) {
    console.log("⏰ Time matched (between 6:00–6:15 AM IST). Sending emails...");
    await sendEmailsToAllUsers();
    lastSentDate = today;
  } else if (!isInWindow && alreadySentToday) {
    // Reset the flag after the time window ends
    if (hour > 6 || (hour === 6 && minute > 15)) {
      lastSentDate = null;
      console.log("🔄 Time window over, reset for next day.");
    }
  }
}, 30000);

console.log("🔁 Email reminder loop is running. Waiting for 6:00–6:15 AM IST...");
