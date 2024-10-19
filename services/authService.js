const Login = require("../models/loginMast");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authService = {
  async register(userData) {
    const { login_name, login_email, login_mobile, login_pass, login_type } =
      userData;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(login_pass, salt);

    const newUser = await Login.create({
      login_name,
      login_email,
      login_mobile,
      login_pass: hashedPassword,
      login_type,
      reg_date: new Date(),
    });

    return newUser;
  },

  async login(login_email, login_pass) {
    const user = await Login.findOne({ where: { login_email } });
    if (!user) throw new Error("Invalid email or password");

    const validPassword = await bcrypt.compare(login_pass, user.login_pass);
    if (!validPassword) throw new Error("Invalid email or password");

    const token = this.generateToken(user);

    return { token, user };
  },

  generateToken(user) {
    return jwt.sign(
      { login_id: user.login_id, login_type: user.login_type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  },

  async verifyGoogleToken(token) {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  },

  async findOrCreateGoogleUser(payload) {
    const { email, name, picture } = payload;
    let user = await Login.findOne({ where: { login_email: email } });
    if (!user) {
      user = await Login.create({
        login_name: name,
        login_email: email,
        login_type: "GOOGLE",
        login_pass: await bcrypt.hash(Math.random().toString(36), 10), // Generate a random password
        reg_date: new Date(),
        profile_picture: picture,
      });
    }
    return user;
  },

  async changePassword(login_id, oldPass, newPass) {
    const user = await Login.findByPk(login_id);
    if (!user) throw new Error("User not found");

    const validPassword = await bcrypt.compare(oldPass, user.login_pass);
    if (!validPassword) throw new Error("Invalid password");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPass, salt);

    user.login_pass = hashedPassword;
    await user.save();

    return user;
  },
};

module.exports = authService;
