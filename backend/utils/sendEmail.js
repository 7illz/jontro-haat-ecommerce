const { Resend } = require('resend');

const sendEmail = async (options) => {
  try {
    // If no API key is provided, log a warning and return instantly
    if (!process.env.RESEND_API_KEY) {
      console.log('No RESEND_API_KEY provided. Skipping email.');
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send the email using Resend API
    const data = await resend.emails.send({
      from: 'NexusStore <onboarding@resend.dev>', // You must use this specific address for free sandbox tier
      to: options.email,
      subject: options.subject,
      html: options.html,
    });

    if (data.error) {
      throw new Error(data.error.message || 'Email provider rejected the message.');
    }

    console.log("----------------------------------------");
    console.log("📧 EMAIL SENT SUCCESSFULLY VIA RESEND!");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Resend Data: ${JSON.stringify(data)}`);
    console.log("----------------------------------------");

  } catch (error) {
    console.error("Error sending email via Resend:", error);
  }
};

module.exports = sendEmail;
