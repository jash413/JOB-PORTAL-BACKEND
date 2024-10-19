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
 *               login_pass:
 *                 type: string
 *                 example: "password123"
 *               login_type:
 *                 type: string
 *                 example: "AMN"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       500:
 *         description: Internal server error
 */
exports.register = async (req, res) => {
  try {
    const newUser = await authService.register(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
 *                  type: object
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
    res.status(400).json({ error: error.message });
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
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token obtained from the client-side Google Sign-In
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
 *                   description: JWT token for authenticated requests
 *                 user:
 *                   type: object
 *                   description: User information
 *                   properties:
 *                     login_id:
 *                       type: string
 *                     login_name:
 *                       type: string
 *                     login_email:
 *                       type: string
 *                     login_type:
 *                       type: string
 *       400:
 *         description: Invalid token or authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const payload = await authService.verifyGoogleToken(token);
    const user = await authService.findOrCreateGoogleUser(payload);
    const jwtToken = authService.generateToken(user);
    res.json({ token: jwtToken, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
 *                 description: User's current password
 *               newPass:
 *                 type: string
 *                 description: User's new password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login_id:
 *                   type: string
 *                 login_name:
 *                   type: string
 *                 login_email:
 *                   type: string
 *                 login_type:
 *                   type: string
 *       400:
 *         description: Invalid request or password change failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
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
    res.status(400).json({ error: error.message });
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
 *         content:
 *           application/json:
 *             schema:
 *              type: object
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
    res.status(500).json({ error: error.message });
  }
};
