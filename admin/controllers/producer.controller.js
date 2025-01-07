const Producer = require("../models/producer.model");
const Product = require("../models/product.model");

module.exports = {
  showListProducer: async (req, res) => {
    let perPage = 2; // số lượng sản phẩm xuất hiện trên 1 page
    let page = req.query.page || 1; // số page hiện tại
    if (page < 1) {
      page = 1;
    }

    Producer.find() // find tất cả các data
      .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
      .limit(perPage)
      .exec((err, producers) => {
        Producer.countDocuments(async (err, count) => {
          // đếm để tính có bao nhiêu trang
          if (err) return next(err);
          let isCurrentPage;
          const listProducts = [];

          for (let i = 0; i < producers.length; i++) {
            const product = await Product.find({
              _id: { $in: producers[i].listIdProduct },
            });

            listProducts.push(product);
          }
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
          res.render("producer/list-producer", {
            producers,
            pages,
            isNextPage: page < Math.ceil(count / perPage),
            isPreviousPage: page > 1,
            nextPage: +page + 1,
            previousPage: +page - 1,
            products: listProducts,
            length: listProducts.length,
          });
        });
      });
  },
  editProducerGet: (req, res) => {
    Producer.findById(req.params.id, (err, producer) => {
      if (err) {
        console.log(err);
      } else {
        res.render("producer/edit-producer", {
          producer,
        });
      }
    });
  },
  editProducerPost: (req, res) => {
    Producer.findByIdAndUpdate(
      req.body.id,
      {
        name: req.body.name,
      },
      (err, category) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/producer?page=1");
        }
      }
    );
  },
  deleteProducer: async (req, res) => {
    const producer = await Producer.findById(req.params.id);
    const listIdProduct = producer.listIdProduct;

    for (let i = 0; i < listIdProduct.length; i++) {
      await Product.findByIdAndDelete(listIdProduct[i]);
    }

    await Producer.findByIdAndDelete(req.params.id);
    res.redirect("/producer?page=1");
  },
  addProducerPost: async (req, res) => {
    const producer = new Producer({
      name: req.body.name,
      listIdProduct: [],
    });
    await producer.save();
    res.redirect("/producer?page=1");
  },
};
