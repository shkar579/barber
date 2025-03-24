module.exports = (req, res, next) => {
    if (req.session.user.User_role !== "admin") {
        return res.redirect("/admin/dashboard");
    }
    next();
};