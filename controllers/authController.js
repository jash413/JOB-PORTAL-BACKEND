const Login = require("../models/loginMast");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
    const { login_name, login_email, login_mobile, login_pass, login_type } =
      req.body;

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(login_pass, salt);

    // Create the new user in the database
    const newUser = await Login.create({
      login_name,
      login_email,
      login_mobile,
      login_pass: hashedPassword,
      login_type,
      reg_date: new Date(), // Registration date
    });

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

    // Check if user exists
    const user = await Login.findOne({ where: { login_email } });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    // Check password
    const validPassword = await bcrypt.compare(login_pass, user.login_pass);
    if (!validPassword)
      return res.status(400).json({ error: "Invalid email or password" });

    // Generate JWT token
    const token = jwt.sign(
      { login_id: user.login_id, login_type: user.login_type },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
