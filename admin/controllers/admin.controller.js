const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");
const passport = require("passport");
const AuthMiddleware = require("../middlewares/auth");

module.exports = {
    getLogin: (req, res, next) => {
        if (req.user) {
            return res.redirect("/");
        }

        res.render("admin/login", {
            layout: false,
        });
    },
    postLogin: (req, res, next) => {
        passport.authenticate(
            "local",
            {
                successRedirect: "/",
                failureRedirect: "/login",
                failureFlash: true,
            },
            (err, admin, info) => {
                if (err) {
                    return next(err);
                }

                if (!admin) {
                    return res.render("admin/login", {
                        layout: false,
                        error: "Tài khoản hoặc mật khẩu không đúng",
                    });
                }
                const retUrl = req.query.retUrl || "/";
                req.logIn(admin, (err) => {
                    if (err) {
                        return next(err);
                    }
                    return res.redirect(retUrl);
                });
            }
        )(req, res, next);
    },
    logout: (req, res, next) => {
        req.logOut();
        req.session.destroy(function (err) {
            res.redirect("/admin/login");
        });
    },
    getAddAdmin: (req, res, next) => {
        if (!req.user) {
            return res.redirect("/admin/login");
        }
        return res.render("admin/add-admin");
    },
    postAddAdmin: (req, res, next) => {
        const hash = bcrypt.hashSync(req.body.password, 10);

        const admin = new Admin({
            username: req.body.username,
            password: hash,
            name: req.body.name,
        });

        admin.save((err) => {
            if (err) return next(err);
            res.redirect("/admin?page=1");
        });
    },
    profile: async (req, res, next) => {
        if (!req.user) {
            return res.redirect("/admin/login");
        }
        // find admin by id using await
        const admin = await Admin.findById(res.locals.authUser._id);
        return res.render("admin/profile", {
            id: res.locals.authUser._id,
            admin,
        });
    },
    getEditProfile: async (req, res, next) => {
        if (!req.user) {
            return res.redirect("/admin/login");
        }
        // find admin by id using await
        const admin = await Admin.findById(res.locals.authUser._id);
        return res.render("admin/edit-profile", {
            id: res.locals.authUser._id,
            admin,
        });
    },
    postEditProfile: async (req, res, next) => {
        if (!req.user) {
            return res.redirect("/admin/login");
        }
        const admin = await Admin.findById(req.body.id);
        admin.name = req.body.name;
        admin.username = req.body.username;
        await admin.save();
        return res.redirect("/admin/profile");
    },
    getChangePassword: async (req, res, next) => {
        if (!req.user) {
            return res.redirect("/admin/login");
        }
        return res.render("admin/change-password", {
            id: res.locals.authUser._id,
        });
    },
    postChangePassword: async (req, res, next) => {
        if (!req.user) {
            return res.redirect("/admin/login");
        }
        const admin = await Admin.findById(req.body.id);
        const isMatch = bcrypt.compareSync(
            req.body.oldPassword,
            admin.password
        );
        if (!isMatch) {
            return res.render("admin/change-password", {
                id: res.locals.authUser._id,
                error: "Mật khẩu cũ không đúng",
            });
        }
        if (req.body.newPassword !== req.body.confirmPassword) {
            return res.render("admin/change-password", {
                id: res.locals.authUser._id,
                error: "Mật khẩu mới không trùng khớp",
            });
        }
        const hash = bcrypt.hashSync(req.body.newPassword, 10);
        admin.password = hash;
        await admin.save();
        return res.redirect("/admin/profile");
    },
    showAllAdmin: async (req, res, next) => {
        if (!req.user) {
            return res.redirect("/admin/login");
        }
        let perPage = 10; // số lượng sản phẩm xuất hiện trên 1 page
        let page = req.query.page || 1; // số page hiện tại
        if (page < 1) {
            page = 1;
        }

        Admin.find() // find tất cả các data
            .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, admins) => {
                Admin.countDocuments((err, count) => {
                    // đếm để tính có bao nhiêu trang
                    if (err) return next(err);
                    let isCurrentPage;
                    const pages = [];
                    for (let i = 1; i <= Math.ceil(count / perPage); i++) {
                        if (i === +page) {
                            isCurrentPage = true;
                        } else {
                            isCurrentPage = false;
                        }
                        pages.push({
                            page: i,
                            isCurrentPage: isCurrentPage,
                        });
                    }
                    res.render("admin/list-admin", {
                        admins,
                        pages,
                        isNextPage: page < Math.ceil(count / perPage),
                        isPreviousPage: page > 1,
                        nextPage: +page + 1,
                        previousPage: +page - 1,
                    });
                });
            });
    },
};
