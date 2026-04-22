const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { secret, expiresIn } = require("../config/jwt");

const users = []; // temporary in-memory storage

exports.register = async (req, res) => {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    users.push({ email, password: hashed });

    res.json({ message: "User registered" });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email }, secret, { expiresIn });

    res.json({ token });
};
