const Login = require("../models/loginMast");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const axios = require("axios");
const { Op } = require("sequelize");

// Initialize Google OAuth client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Custom error class for authentication-related errors
class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthenticationError";
  }
}

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Newly created user object
   */
  async register(userData) {
    const { login_name, login_email, login_mobile, login_pass, login_type } =
      userData;

    // Check if user already exists
    await this.checkExistingUser(login_email, login_mobile);

    // Validate password and mobile number
    this.validatePassword(login_pass);
    this.validateMobile(login_mobile);

    // Hash the password
    const hashedPassword = await this.hashPassword(login_pass);

    // Create new user
    const newUser = await Login.create({
      login_name,
      login_email,
      login_mobile,
      login_pass: hashedPassword,
      login_type,
      reg_date: new Date(),
      phone_ver_status: 0,
      email_ver_status: 0,
    });

    return newUser;
  },

  /**
   * Authenticate user login
   * @param {string} login_email - User's email
   * @param {string} login_pass - User's password
   * @returns {Object} Token and user object
   */
  async login(login_email, login_pass) {
    const user = await Login.findOne({ where: { login_email } });
    if (!user) throw new AuthenticationError("Invalid email or password");
    const validPassword = await bcrypt.compare(login_pass, user.login_pass);
    if (!validPassword)
      throw new AuthenticationError("Invalid email or password");

    const token = this.generateToken(user);

    return { token, user };
  },

  /**
   * Authenticate with Google
   * @param {string} token - Google ID token
   * @returns {Object} Token and user object
   */
  async googleLogin(token, login_type) {
    const payload = await this.verifyGoogleToken(token);
    const user = await this.findOrCreateGoogleUser(payload, login_type);
    const authToken = this.generateToken(user);
    return { token: authToken, user };
  },

  /**
   * Change user password
   * @param {number} login_id - User ID
   * @param {string} oldPass - Old password
   * @param {string} newPass - New password
   * @returns {Object} Updated user object
   */
  async changePassword(login_id, oldPass, newPass) {
    const user = await Login.findByPk(login_id);
    if (!user) throw new AuthenticationError("User not found");

    this.validatePassword(newPass);

    const validPassword = await bcrypt.compare(oldPass, user.login_pass);
    if (!validPassword) throw new AuthenticationError("Invalid password");

    user.login_pass = await this.hashPassword(newPass);
    await user.save();

    return user;
  },

  /**
   * Initiate forgot password process
   * @param {string} login_email - User's email
   * @returns {string} Reset token
   */
  async forgotPassword(login_email) {
    const user = await Login.findOne({ where: { login_email } });
    if (!user) return { error: "User not found" };

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    user.reset_token = resetToken;
    user.reset_token_expiry = resetTokenExpiry;
    await user.save();

    await this.sendPasswordResetEmail(user.login_email, resetToken);

    return resetToken;
  },

  /**
   * Mobile Login
   * @param {string} login_mobile - User's mobile number
   * @returns {string} OTP
   */
  async mobileLogin(login_mobile) {
    const user = await Login.findOne({ where: { login_mobile } });
    if (!user) return { error: "User not found" };

    const otp = await this.sendPhoneVerificationOTP(user);
    return otp;
  },

  /**
   * Reset password using token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Object} Updated user object
   */
  async resetPassword(token, newPassword) {
    const user = await Login.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: { [Op.gt]: Date.now() },
      },
    });

    if (!user) throw new AuthenticationError("Invalid or expired reset token");

    this.validatePassword(newPassword);

    user.login_pass = await this.hashPassword(newPassword);
    user.reset_token = null;
    user.reset_token_expiry = null;
    await user.save();

    return user;
  },

  /**
   * Verify user's email
   * @param {string} token - Email verification token
   * @returns {Object} Updated user object
   */
  async verifyEmail(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Login.findByPk(decoded.login_id);
    if (!user) throw new AuthenticationError("User not found");

    user.email_ver_status = true;
    await user.save();

    return user;
  },

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    return jwt.sign(
      {
        login_id: user.login_id,
        login_type: user.login_type,
        login_email: user.login_email,
        login_mobile: user.login_mobile,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @throws {AuthenticationError} If password doesn't meet criteria
   */
  validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,20}$/;
    if (!passwordRegex.test(password)) {
      throw new AuthenticationError(
        "Password must be between 8 and 20 characters long and contain at least one lowercase letter, one uppercase letter, and one number"
      );
    }
  },

  /**
   * Validate mobile number format
   * @param {string} mobile - Mobile number to validate
   * @throws {AuthenticationError} If mobile number format is invalid
   */
  validateMobile(mobile) {
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      throw new AuthenticationError("Mobile number must be 10 digits long");
    }
  },

  /**
   * Hash password
   * @param {string} password - Password to hash
   * @returns {string} Hashed password
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  /**
   * Verify Google token
   * @param {string} token - Google ID token
   * @returns {Object} Payload from Google token
   */
  async verifyGoogleToken(token) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload();
    } catch (error) {
      throw new AuthenticationError("Invalid Google token");
    }
  },

  /**
   * Find or create user from Google login
   * @param {Object} payload - Google user data
   * @returns {Object} User object
   */
  async findOrCreateGoogleUser(payload, login_type) {
    try {
      const { email, name } = payload;
      let user = await Login.findOne({ where: { login_email: email } });
      if (!user) {
        user = await Login.create({
          login_name: name,
          login_email: email,
          login_type: login_type,
          login_pass: await this.hashPassword(
            crypto.randomBytes(20).toString("hex")
          ),
          reg_date: new Date(),
          email_ver_status: 1, // Google accounts are considered verified
        });
      }
      return user;
    } catch (error) {
      console.error("Error finding or creating Google user:", error);
      throw new AuthenticationError("Failed to find or create Google user");
    }
  },

  /**
   * Check if user already exists
   * @param {string} email - User's email
   * @param {string} mobile - User's mobile number
   * @throws {AuthenticationError} If user already exists
   */
  async checkExistingUser(email, mobile) {
    const emailExists = await Login.findOne({ where: { login_email: email } });
    if (emailExists) throw new AuthenticationError("Email already exists");

    const mobileExists = await Login.findOne({
      where: { login_mobile: mobile },
    });
    if (mobileExists)
      throw new AuthenticationError("Mobile number already exists");
  },

  /**
   * Send verification email
   * @param {Object} user - User object
   */
  async sendVerificationEmail(user) {
    try {
      const token = jwt.sign(
        { login_id: user.login_id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
      // Send verification email

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // HTML template for the email
      const htmlTemplate = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Ifas Job Portal Account</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }
        .container {
            width: 100%;
            max-width: 28rem;
        }
        .card {
            background-color: white;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border-radius: 1rem;
            overflow: hidden;
            transition: transform 0.5s;
        }
        .card:hover {
            transform: scale(1.05);
        }
        .gradient-bar {
            background: linear-gradient(to right, #ef4444, #ec4899);
            height: 0.25rem;
            width: 100%;
        }
        .card-content {
            padding: 2rem;
        }
        .logo-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        .logo {
            height: 3rem;
            width: auto;
            filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07));
        }
        .title {
            font-size: 1.875rem;
            font-weight: 700;
            color: #1f2937;
            text-align: center;
            margin-bottom: 1rem;
        }
        .description {
            color: #4b5563;
            text-align: center;
            margin-bottom: 1.5rem;
            line-height: 1.625;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(to right, #ef4444, #ec4899);
            color: white;
            font-weight: 600;
            padding: 0.75rem 2rem;
            border-radius: 9999px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            text-align: center;
            text-decoration: none;
            width: 100%;
            max-width: 300px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .verify-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: all 0.6s;
        }
        .verify-button:hover::before {
            left: 100%;
        }
        .verify-button:hover {
            box-shadow: 0 15px 20px -3px rgba(0, 0, 0, 0.15);
            transform: translateY(-0.25rem);
        }
        .button-container {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
        }
        .verification-link {
            background-color: #f9fafb;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1.5rem;
        }
        .verification-link-text {
            font-size: 0.875rem;
            color: #4b5563;
            text-align: center;
        }
        .verification-url {
            color: #ef4444;
            word-break: break-all;
            font-family: monospace;
        }
        .footer-text {
            font-size: 0.75rem;
            color: #6b7280;
            text-align: center;
        }
        .support-link {
            color: #ef4444;
            text-decoration: none;
        }
        .support-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="gradient-bar"></div>
            
            <div class="card-content">
                <div class="logo-container">
                    <img src="/api/placeholder/120/40" alt="Job Portal Logo" class="logo">
                    <img src="/api/placeholder/120/40" alt="Company Logo" class="logo">
                </div>
                
                <h2 class="title">
                    Verify Your Account
                </h2>
                
                <p class="description">
                    Welcome to your professional journey! Please verify your email to unlock full access to our job portal and start exploring exciting career opportunities.
                </p>
                
                <div class="button-container">
                    <a href="${verificationUrl}" class="verify-button">
                        Verify Email Address
                    </a>
                </div>
                
                <div class="verification-link">
                    <p class="verification-link-text">
                        Verification Link:
                        <br>
                        <span class="verification-url">
                            <a href="${verificationUrl}" style="color: #ef4444; text-decoration: none;">
                                ${verificationUrl}
                            </a>
                        </span>
                    </p>
                </div>
                
                <div class="footer-text">
                    <p>Didn't request this email? <a href="mailto:info@initinfologic.com" class="support-link">Ignore or contact support</a></p>
                    <p style="margin-top: 0.5rem;">© 2024 INIT INFOLOGIC. All rights reserved.</p>
                </div>
            </div>
            
            <div class="gradient-bar"></div>
        </div>
        
        <div style="text-align: center; font-size: 0.875rem; color: #4b5563; margin-top: 1rem;">
            Secure verification powered by <a href="#" style="color: #ef4444; text-decoration: none;">INIT INFOLOGIC</a>
        </div>
    </div>
</body>
</html>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.login_email,
        subject: "Email Verification",
        html: htmlTemplate,
      };

      // Send email and handle response with Promise
      await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            reject(new Error("Failed to send verification email"));
          } else {
            console.log("Verification email sent successfully:", info.response);
            resolve(info);
          }
        });
      });

      return token;
    } catch (error) {
      console.log("Error sending email:", error);
      throw new AuthenticationError("Failed to send email");
    }
  },

  /**
   * Send password reset email
   * @param {string} email - User's email
   * @param {string} token - Reset token
   */
  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Send Professsional Email

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        throw new AuthenticationError("Failed to send email");
      }
    });
  },

  /**
   * Send phone verification OTP
   * @param {Object} user - User object
   */
  async sendPhoneVerificationOTP(user) {
    try {
      const login_user = await Login.findByPk(user.login_id);
      const otp = this.generateOTP();
      const otpExpiry = Date.now() + 600000; // OTP valid for 10 minutes

      login_user.phone_otp = otp;
      login_user.phone_otp_expiry = otpExpiry;
      await login_user.save();

      await this.sendSMS(
        login_user.login_mobile,
        `OTP for SAISUN iFAS ERP App is : ${otp}`
      );

      return otp;
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw new AuthenticationError("Failed to send SMS");
    }
  },

  /**
   * Verify phone OTP
   * @param {number} userId - User ID
   * @param {string} otp - OTP to verify
   * @returns {Object} Updated user object
   */
  async verifyPhoneOTP(userId, otp) {
    const user = await Login.findByPk(userId);
    if (!user) throw new AuthenticationError("User not found");

    if (user.phone_otp !== otp) throw new AuthenticationError("Invalid OTP");
    if (Date.now() > user.phone_otp_expiry)
      throw new AuthenticationError("OTP has expired");

    user.phone_ver_status = 1;
    user.phone_otp = null;
    user.phone_otp_expiry = null;
    await user.save();

    const token = this.generateToken(user);

    return { token, user };
  },

  /**
   * Generate 6-digit OTP
   * @returns {string} 6-digit OTP
   */
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  },

  /**
   * Send SMS using the provided API
   * @param {string} phoneNumber - Recipient's phone number
   * @param {string} message - SMS content
   */
  async sendSMS(phoneNumber, message) {
    try {
      const response = await axios.get(
        `http://msg.jmdinfotek.in/api/mt/SendSMS?user=${process.env.SMS_API_USER}&password=${process.env.SMS_API_PASSWORD}&senderid=${process.env.SMS_API_SENDER_ID}&channel=Trans&DCS=0&flashsms=0&number=${phoneNumber}&text=${message}&route=07`
      );

      if (response.status !== 200) {
        throw new Error("SMS API request failed");
      }

      // You may want to check the response body for any API-specific success indicators
      // and throw an error if the SMS was not sent successfully
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw new AuthenticationError("Failed to send SMS");
    }
  },

  /**
   * Edit user profile
   * @param {number} login_id - User ID
   * @param {Object} body - Updated user data
   * @returns {Object} Updated user object
   * @throws {AuthenticationError} If user not found
   */
  async editProfile(login_id, body) {
    const user = await Login.findByPk(login_id);
    if (!user) throw new AuthenticationError("User not found");
    const { login_name, login_email, login_mobile } = body;

    if (login_email) {
      const emailExists = await Login.findOne({
        where: { login_email, login_id: { [Op.ne]: login_id } },
      });
      if (emailExists) throw new AuthenticationError("Email already exists");
    }

    if (login_mobile) {
      const mobileExists = await Login.findOne({
        where: { login_mobile, login_id: { [Op.ne]: login_id } },
      });
      if (mobileExists)
        throw new AuthenticationError("Mobile number already exists");
    }

    // If email or mobile number is updated, reset verification status
    if (login_email !== user.login_email) user.email_ver_status = 0;
    if (login_mobile !== user.login_mobile) user.phone_ver_status = 0;

    user.login_name = login_name;
    user.login_email = login_email;
    user.login_mobile = login_mobile;
    await user.save();
    return user;
  },
};

module.exports = authService;
