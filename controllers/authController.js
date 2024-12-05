const Login = require("../models/loginMast");
const authService = require("../services/authService");

/**
 * @swagger
 * tags:
 *  name: Authentication
 *  description: API for user authentication
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login_name:
 *                 type: string
 *                 example: "John Doe"
 *               login_email:
 *                 type: string
 *                 example: "john@example.com"
 *               login_mobile:
 *                 type: string
 *                 example: "1234567890"
 *                 description: Mobile number must be 10 digits long
 *               login_pass:
 *                 type: string
 *                 example: "testPassword@1234"
 *                 description: Password must be between 8 and 20 characters long and contain at least one lowercase letter, one uppercase letter, and one number
 *               login_type:
 *                 type: string
 *                 example: "AMN"
 *                 enum: ["AMN", "CND", "EMP"]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request - validation error
 *       500:
 *         description: Internal server error
 */
exports.register = async (req, res) => {
  try {
    const newUser = await authService.register(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    if (error.name === "AuthenticationError") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login_email:
 *                 type: string
 *                 example: "john@example.com"
 *               login_pass:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
exports.login = async (req, res) => {
  try {
    const { login_email, login_pass } = req.body;
    const { token, user } = await authService.login(login_email, login_pass);
    res.json({ token, user });
  } catch (error) {
    if (error.name === "AuthenticationError") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

/**
 * @swagger
 * /api/v1/auth/mobile-login:
 *   post:
 *     summary: Login a user using mobile number
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login_mobile:
 *                 type: string
 *                 example: "1234567890"
 *                 description: Mobile number must be 10 digits long
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid mobile number
 *       500:
 *         description: Server error
 */
exports.mobileLogin = async (req, res) => {
  try {
    const { login_mobile } = req.body;
    const response = await authService.mobileLogin(login_mobile);
    if (response.error) return res.status(400).json(response);
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    if (error.name === "AuthenticationError") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

/**
 * @swagger
 * /api/v1/auth/google:
 *   post:
 *     summary: Authenticate or register a user with Google
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - login_type
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token obtained from the client-side Google Sign-In
 *               login_type:
 *                 type: string
 *                 example: "AMN"
 *                 enum: ["AMN", "CND", "EMP"]
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid token or authentication failed
 *       500:
 *         description: Server error
 */
exports.googleAuth = async (req, res) => {
  try {
    const { token, login_type } = req.body;
    const { token: jwtToken, user } = await authService.googleLogin(
      token,
      login_type
    );
    res.json({ token: jwtToken, user });
  } catch (error) {
    if (error.name === "AuthenticationError") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     summary: Change user's password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPass
 *               - newPass
 *             properties:
 *               oldPass:
 *                 type: string
 *               newPass:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid request or password change failed
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
exports.changePassword = async (req, res) => {
  try {
    const { oldPass, newPass } = req.body;
    const user = await authService.changePassword(
      req.user.login_id,
      oldPass,
      newPass
    );
    res.json(user);
  } catch (error) {
    if (error.name === "AuthenticationError") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Initiate forgot password process
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login_email
 *             properties:
 *               login_email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset token sent successfully
 *       400:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { login_email } = req.body;
    const response = await authService.forgotPassword(login_email);
    if (response.error) return res.status(400).json(response);
    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    if (error.name === "AuthenticationError") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    if (error.name === "AuthenticationError") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

/**
 * @swagger
 * /api/v1/auth/send-email-verification:
 *   post:
 *     summary: Verify user's email
 *     tags: [Authentication]
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email verification link sent successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
exports.sendEmailVerification = async (req, res) => {
  try {
    const user = await Login.findByPk(req.user.login_id);
    const token = await authService.sendVerificationEmail(user);
    if (!token)
      return res
        .status(400)
        .json({ error: "Error sending email verification link" });
    res.json({ message: "Email verification link sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email verification link" });
  }
};

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   get:
 *     summary: Verify user's email
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    await authService.verifyEmail(token);
    res.json({ message: "Email verified successfully" });
  } catch (error) {
    if (error.name === "AuthenticationError") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

/**
 * @swagger
 * /api/v1/auth/send-phone-otp:
 *   post:
 *     summary: Send OTP for phone verification
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
exports.sendPhoneOTP = async (req, res) => {
  try {
    const otp = await authService.sendPhoneVerificationOTP(req.user);
    if (!otp) return res.status(400).json({ error: "Error sending OTP" });
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

/**
 * @swagger
 * /api/v1/auth/verify-phone:
 *   post:
 *     summary: Verify phone OTP
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Phone verified successfully
 *       400:
 *         description: Invalid OTP
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
exports.verifyPhoneOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const response = await authService.verifyPhoneOTP(req.user.login_id, otp);
    res.json({ message: "Phone verified successfully", response });
  } catch (error) {
    if (error.name === "AuthenticationError") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

/**
 * @swagger
 * /api/v1/auth/mobile-login-otp:
 *   post:
 *     summary: Login a user using mobile number and OTP
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *               login_mobile:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Server error
 */
exports.mobileLoginOTPVerification = async (req, res) => {
  try {
    const { otp, login_mobile } = req.body;
    const user = await Login.findOne({ where: { login_mobile } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const { token } = await authService.verifyPhoneOTP(user.login_id, otp);
    res.json({ token, user });
  } catch (error) {
    if (error.name === "AuthenticationError") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get the user's profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's profile information
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await Login.findByPk(req.user.login_id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

/**
 * @swagger
 * /api/v1/auth/edit-profile:
 *   put:
 *     summary: Update the user's profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login_name:
 *                 type: string
 *                 example: "John Doe"
 *               login_email:
 *                 type: string
 *                 example: "john@mail.com"
 *               login_mobile:
 *                 type: string
 *                 example: "1234567890"
 *                 description: Mobile number must be 10 digits long
 *     responses:
 *       200:
 *         description: The user's profile information updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
exports.editProfile = async (req, res) => {
  try {
    const user = await authService.editProfile(req.user.login_id, req.body);
    res.json(user);
  } catch (error) {
    if (error.name === "AuthenticationError") {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};
