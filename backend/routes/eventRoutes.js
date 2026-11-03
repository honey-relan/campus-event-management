
const notifyAllUsers = async (event, action) => {
  try {
    console.log("Starting email notifications...");

    console.log("EMAIL_USER configured:", !!process.env.EMAIL_USER);
    console.log("EMAIL_PASS configured:", !!process.env.EMAIL_PASS);

    const users = await User.find({}, "email");

    console.log("Registered users found:", users.length);

    const subject = `Campus Events - ${action}: ${event.name || event.title}`;

    const message = `
Hello,

${action}

Event: ${event.name || event.title}
Category: ${event.category}
Date: ${event.date}
Time: ${event.time || "Not specified"}
Venue: ${event.venue}
Organizer: ${event.organizer}
Description: ${event.description}

Visit Campus Event Management to see more details.

Regards,
Campus Event Management Team
`;

    const recipients = users.filter(user => user.email);

    const results = await Promise.allSettled(
      recipients.map(user =>
        sendEmail(user.email, subject, message)
      )
    );

    const successful = results.filter(
      result => result.status === "fulfilled"
    ).length;

    const failed = results.filter(
      result => result.status === "rejected"
    );

    console.log("Emails sent successfully:", successful);
    console.log("Emails failed:", failed.length);

    failed.forEach((result, index) => {
      console.error(
        `Email failure ${index + 1}:`,
        result.reason?.message || result.reason
      );
    });

  } catch (error) {
    console.error("Email notification error:", error.message);
  }
};
