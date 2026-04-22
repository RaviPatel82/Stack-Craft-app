module.exports = {
    secret: process.env.JWT_SECRET || "supersecret",
    expiresIn: "1d",
};
