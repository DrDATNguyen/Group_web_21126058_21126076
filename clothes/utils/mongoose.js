module.exports = {
    mutipleMongooseToObject: function (mongooses) {
      return mongooses.map((mongooses) => mongooses.toObject());
    },
  
    mongooseToObject: function (mongooseDocument) {
      // Kiểm tra nếu là tài liệu Mongoose và có phương thức toObject
      if (mongooseDocument && typeof mongooseDocument.toObject === 'function') {
        return mongooseDocument.toObject();
      }
    
      // Nếu không, trả về nguyên giá trị (Plain Object hoặc null/undefined)
      return mongooseDocument;
    },
    
  
    getListCategory: function (products) {
        var listCategory = [];
        products.forEach((element) => {
          var check = true;
          listCategory.forEach((category) => {
            if (element.category === category) {
                check = false;
            }
          });
          if (check == true) {
            listCategory.push(element.category);
          }
        });
        return listCategory;
    },
};