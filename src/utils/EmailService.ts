import nodemailer from "nodemailer";
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});
export const sendEmail = async (
  otp: string,
  email: string,
  expireIn: string = "10 minutes",
): Promise<void> => {
  try {
    await transport.sendMail({
      from: `"Courses platform"<${process.env.EMAIL}>`,
      to: email,
      subject: "Verification Email",
      html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #1a73e8;">Welcome to Our Platform</h1>
            <p>Hello,</p>
            <p style="font-size: 16px;font-weight: bold;font-family: 'Cairo', sans-serif;">Thank you for joining our platform! To complete your registration, please verify your email address by entering the code below.</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f3f3f3; border-radius: 8px; display: inline-block;">
            <strong style="font-size: 24px; letter-spacing: 2px;">${otp}</strong>
            </div>
            
            <p>This code will expire in <strong>${expireIn}</strong>.</p>
            
            <p>If you did not create this account, please ignore this email.</p>
            
            <p>Best regards,<br>The Courses Platform Team</p>
</div>

`,
    });
    console.log("email sent successfully ");
  } catch (err) {
    console.log(err);
  }
};
