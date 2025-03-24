const users = require('../models/users');

exports.Postlogin = (async (req, res) => {
    const { username, password } = req.body;
    const rows = await users.getAll();

    const user = rows.find(
        (u) => u.Username === username && u.Password === password
    );

    if (user) {
        req.session.isLoggedIn = true;
        req.session.user = user;

        // Set session cookie parameters
        req.session.cookie.httpOnly = true;
        // req.session.cookie.secure = process.env.NODE_ENV === 'production';
        req.session.cookie.sameSite = 'strict';
        req.session.cookie.maxAge = 1 * 60 * 60 * 1000; // 24 hours in milliseconds
        // req.session.cookie.maxAge = 30 * 1000; // 30 seconds in milliseconds

        return req.session.save((err) => {
            if (err) console.error(err);
            res.redirect("/admin/dashboard");
        });
    } else {
        // Reload login page with an error message
        res.render("login", { message: "بەکارهێنەر یان وشەی نهێنی هەڵەیە" });
    }
});

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        // Clear the session cookie on client
        res.clearCookie('connect.sid');
        res.redirect("/");
    });
};