import * as nodemailer from 'nodemailer';

async function sendEmail() {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // or your SMTP host
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'sakshamghimire@lftechnology.com',
      pass: 'xplp evkk fgeb ihxg'  // for Gmail, use App Password
    }
  });
`   `
  try {
    // Send email
    const info = await transporter.sendMail({
      from: 'sakshamghimire@lftechnology.com',
      to: "alinadangol@lftechnology.com",
      subject: "Test Email with Attachment",
      text: "Hello, this is a test email with attachment.",
      html: "<b>Hello</b>, this is a test email with attachment.",
      attachments: [
        {
          filename: 'test.txt',
          contentDisposition: 'attachment',
          content: new Buffer('hello world!','utf-8')
        },
      ]
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

// Run the function
sendEmail();