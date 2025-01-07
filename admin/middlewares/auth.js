module.exports = (req, res, next) => {
  if (!req.user) {
    return res.render("admin/login", {
      layout: false,
    });
  } else {
    next();
  }
};
