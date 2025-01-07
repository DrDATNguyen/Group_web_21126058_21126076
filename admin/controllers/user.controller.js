const User = require("../models/user.model");

module.exports = {
    getAllUsers: (req, res, next) => {
        let perPage = 10; // số lượng sản phẩm xuất hiện trên 1 page
        let page = req.query.page || 1; // số page hiện tại
        if (page < 1) {
            page = 1;
        }

        User.find() // find tất cả các data
            .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, account) => {
                User.countDocuments((err, count) => {
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
                    res.render("account/list-account", {
                        account,
                        pages,
                        isNextPage: page < Math.ceil(count / perPage),
                        isPreviousPage: page > 1,
                        nextPage: +page + 1,
                        previousPage: +page - 1,
                    });
                });
            });
    },
    addAccount: (req, res) => {
        const { name, email, password, address } = req.body;
        const newUser = new User({
            name,
            email,
            password,
            address,
            status: true,
        });
        newUser.save((err) => {
            if (err) return next(err);
            res.redirect("/account?page=1");
        });
    },
    editAccountGet: (req, res) => {
        User.findById(req.params.id, (err, account) => {
            if (err) return next(err);
            res.render("account/edit-account", {
                account,
            });
        });
    },
    editAccountPost: (req, res) => {
        User.findByIdAndUpdate(
            req.body.id,
            {
                $set: {
                    name: req.body.name,
                    email: req.body.email,
                    address: req.body.address,
                },
            },
            (err, account) => {
                if (err) return next(err);
                res.redirect("/account?page=1");
            }
        );
    },
    blockAccount: (req, res) => {
        User.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    status: false,
                },
            },
            (err, account) => {
                if (err) return next(err);
                res.redirect("/account?page=1");
            }
        );
    },
    unblockAccount: (req, res) => {
        User.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    status: true,
                },
            },
            (err, account) => {
                if (err) return next(err);
                res.redirect("/account?page=1");
            }
        );
    },
    deleteAccount: (req, res) => {
        User.findByIdAndDelete(req.params.id, (err, account) => {
            if (err) return next(err);
            res.redirect("/account?page=1");
        });
    },
};
