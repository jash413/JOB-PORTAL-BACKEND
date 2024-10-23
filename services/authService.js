const Login = require("../models/loginMast");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const axios = require("axios");

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
  async googleLogin(token) {
    const payload = await this.verifyGoogleToken(token);
    const user = await this.findOrCreateGoogleUser(payload);
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
    if (!user) throw new AuthenticationError("User not found");

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    user.reset_token = resetToken;
    user.reset_token_expiry = resetTokenExpiry;
    await user.save();

    await this.sendPasswordResetEmail(user.login_email, resetToken);

    return resetToken;
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
      { login_id: user.login_id, login_type: user.login_type },
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
  async findOrCreateGoogleUser(payload) {
    const { email, name, picture } = payload;
    let user = await Login.findOne({ where: { login_email: email } });
    if (!user) {
      user = await Login.create({
        login_name: name,
        login_email: email,
        login_type: "GOOGLE",
        login_pass: await this.hashPassword(
          crypto.randomBytes(20).toString("hex")
        ),
        reg_date: new Date(),
        profile_picture: picture,
        email_ver_status: true, // Google accounts are considered verified
        phone_verified: false, // Phone verification still required
      });
    }
    return user;
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

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.login_email,
      subject: "Email Verification",
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        throw new AuthenticationError("Failed to send email");
      }
    });

    // Implement email sending logic here
    // You can use nodemailer or any other email service
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
    const otp = this.generateOTP();
    const otpExpiry = Date.now() + 600000; // OTP valid for 10 minutes

    user.phone_otp = otp;
    user.phone_otp_expiry = otpExpiry;
    await user.save();

    await this.sendSMS(
      user.login_mobile,
      `OTP for SAISUN iFAS ERP App is : ${otp}`
    );
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

    user.phone_verified = true;
    user.phone_otp = null;
    user.phone_otp_expiry = null;
    await user.save();

    return user;
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
};

module.exports = authService;
