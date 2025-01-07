const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Producer = require("../models/producer.model");
const to_slug = require("../public/js/slug.js");

module.exports = {
    showListProduct: (req, res) => {
        let perPage = 5; // số lượng sản phẩm xuất hiện trên 1 page
        let page = req.query.page || 1; // số page hiện tại
        if (page < 1) {
            page = 1;
        }

        Product.find() // find tất cả các data
            .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
            .limit(perPage)
            .exec((err, product) => {
                Product.countDocuments((err, count) => {
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
                    res.render("product/list-product", {
                        product,
                        pages,
                        isNextPage: page < Math.ceil(count / perPage),
                        isPreviousPage: page > 1,
                        nextPage: +page + 1,
                        previousPage: +page - 1,
                    });
                });
            });
    },
    addProductGet: async (req, res) => {
        const category = await Category.find({});
        const producer = await Producer.find({});
        res.render("product/add-product", {
            category,
            producer,
        });
    },
    //add product post and add product id to category and producer
    addProductPost: async (req, res) => {
        const inputFields = {
            name: req.body.name,
            details: req.body.details,
            quantity: req.body.quantity,
            price: req.body.price,
            urlImage: req.body.urlImage,
            listUrlImageExtra: req.body.listUrlImageExtra,
            id_category: req.body.id_category,
            id_producer: req.body.id_producer,
        };
    
        // Log các giá trị null hoặc undefined
        Object.entries(inputFields).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                console.log(`Giá trị đầu vào "${key}" là null hoặc undefined.`);
            }
        });
        try {
            // Kiểm tra dữ liệu đầu vào
            const { name, details, quantity, price, urlImage, listUrlImageExtra, id_category, id_producer } = req.body;
            console.log(listUrlImageExtra)
            console.log(urlImage)

            if (!name || !details || !quantity || !price || !urlImage || !listUrlImageExtra || !id_category || !id_producer) {
                return res.render("product/add-product", {
                    msg: "Vui lòng điền đầy đủ thông tin.",
                });
            }
    
            // Kiểm tra danh mục
            const category = await Category.findById(id_category);
            if (!category) {
                return res.render("product/add-product", {
                    msg: "Danh mục không tồn tại.",
                });
            }
    
            // Tạo id sản phẩm và url
            const idProduct = `${to_slug(name)}-${Date.now()}`;
            const url = `${category.idCategory}/${idProduct}`;
    
            // Chuyển đổi danh sách ảnh bổ sung
            const listImgExtra = listUrlImageExtra.split(",").map(img => img.trim());
            if (listImgExtra.some(img => img === "")) {
                return res.render("product/add-product", {
                    msg: "Danh sách ảnh bổ sung không hợp lệ.",
                });
            }
    
            // Tạo sản phẩm mới
            const product = new Product({
                name,
                details,
                quantity,
                price,
                image: urlImage,
                listImgExtra,
                category: id_category,
                producer: id_producer,
                idProduct,
                listIdRating: [],
                url,
            });
    
            // Lưu sản phẩm
            await product.save();
    
            // Cập nhật danh mục
            await Category.findByIdAndUpdate(id_category, {
                $push: { listIdProduct: product._id },
            });
    
            // Cập nhật nhà sản xuất
            await Producer.findByIdAndUpdate(id_producer, {
                $push: { listIdProduct: product._id },
            });
    
            res.redirect("/product?page=1");
        } catch (err) {
            console.error(err);
            res.render("product/add-product", {
                msg: "Đã xảy ra lỗi trong quá trình thêm sản phẩm.",
            });
        }
    },
    
    // edit product and find current id category of this product
    editProductGet: async (req, res) => {
        // find all category using async await
        const category = await Category.find({});
        const producer = await Producer.find({});

        // find id category that have this product id in listIdProduct
        Product.findById(req.params.id, (err, product) => {
            if (err) {
                console.log(err);
                return;
            }
            Category.find(
                { listIdProduct: product._id },
                (err, currentCategory) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    res.render("product/edit-product", {
                        product,
                        producer,
                        category,
                        idCurrentCategory: currentCategory[0]._id,
                    });
                }
            );
        });
    },
    // edit product post and remove product id to old category and push product id to new category
    // and remove product id from listIdProduct of old producer and push product id to new producer
    // and using async await
    editProductPost: async (req, res) => {
        // find product and update
        const category = await Category.findById(req.body.id_category);
        const idProduct = to_slug(req.body.name) + "-" + Date.now();
        const url = category.idCategory + "/" + idProduct;
        const listImgExtra = await req.body.listUrlImageExtra.split(",");
        const product = await Product.findByIdAndUpdate(
            req.body.id,
            {
                $set: {
                    name: req.body.name,
                    details: req.body.details,
                    quantity: req.body.quantity,
                    price: req.body.price,
                    image: req.body.urlImage,
                    listImgExtra: listImgExtra,
                    category: req.body.category,
                    producer: req.body.producer,
                    idProduct: idProduct,
                    listIdRating: [],
                    url: url,
                },
            },
            async (err, product) => {
                if (err) return next(err);
                // find old category and remove product id
                const currentCategory = await Category.find({
                    listIdProduct: product._id,
                }).clone();
                // find category and remove product id
                await Category.findByIdAndUpdate(
                    currentCategory[0]._id,
                    {
                        $pull: {
                            listIdProduct: product._id,
                        },
                    },
                    async (err, cha) => {
                        if (err) {
                            console.log(err);
                        } else {
                            // find category and push product id
                            await Category.findByIdAndUpdate(
                                req.body.id_category,
                                {
                                    $addToSet: {
                                        listIdProduct: product._id,
                                    },
                                },
                                async (err, cha) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        // find old producer and remove product id
                                        const currentProducer =
                                            await Producer.find({
                                                listIdProduct: product._id,
                                            }).clone();
                                        // find producer and remove product id
                                        await Producer.findByIdAndUpdate(
                                            currentProducer[0]._id,
                                            {
                                                $pull: {
                                                    listIdProduct: product._id,
                                                },
                                            },
                                            async (err, cha) => {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    // find producer and push product id
                                                    await Producer.findByIdAndUpdate(
                                                        req.body.id_producer,
                                                        {
                                                            $addToSet: {
                                                                listIdProduct:
                                                                    product._id,
                                                            },
                                                        },
                                                        (err, cha) => {
                                                            if (err) {
                                                                console.log(
                                                                    err
                                                                );
                                                            } else {
                                                                res.redirect(
                                                                    "/product?page=1"
                                                                );
                                                            }
                                                        }
                                                    ).clone();
                                                }
                                            }
                                        ).clone();
                                    }
                                }
                            ).clone();
                        }
                    }
                ).clone();
            }
        ).clone();
    },
    // delete product and remove product id to category and producer
    deleteProduct: async (req, res) => {
        Product.findByIdAndDelete(req.params.id, async (err, product) => {
            if (err) return next(err);
            // find category and remove product id
            const currentCategory = await Category.find({
                listIdProduct: req.params.id,
            }).clone();
            // find category and remove product id
            await Category.findByIdAndUpdate(
                currentCategory[0]._id,
                {
                    $pull: {
                        listIdProduct: req.params.id,
                    },
                },
                async (err, cha) => {
                    if (err) {
                        console.log(err);
                    } else {
                        // find producer and remove product id
                        const currentProducer = await Producer.find({
                            listIdProduct: req.params.id,
                        }).clone();
                        // find producer and remove product id
                        await Producer.findByIdAndUpdate(
                            currentProducer[0]._id,
                            {
                                $pull: {
                                    listIdProduct: req.params.id,
                                },
                            },
                            (err, cha) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    res.redirect("/product?page=1");
                                }
                            }
                        ).clone();
                    }
                }
            ).clone();
        }).clone();
    },
};
