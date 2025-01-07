// async function upload(str) {
//   // const ref = firebase.storage().ref();
//   let urlImage = [];
//   var inputs = document.querySelector(str).files;
//   console.log(inputs.length);
//   for (let i = 0; i < inputs.length; i++) {
//     //deal with each input
//     let file = inputs[i];
//     let token = await uploadOneImage(file, ref);
//     urlImage.push(token);
//   }
//   return urlImage;
// }

// function uploadOneImage(file, ref) {
//   let metaData = {
//     contentType: file.type,
//   };
//   let name = file.name;
//   let uploadImage = ref.child(name).put(file, metaData);

//   let urlImage = "";

//   return uploadImage
//     .then((snapshot) => snapshot.ref.getDownloadURL())
//     .then((url) => {
//       urlImage = url;
//       console.log(urlImage);
//       return urlImage;
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }
// async function upload(str) {
//   let urlImage = [];
//   let inputs = document.querySelector(str).files;

//   console.log(inputs.length);

//   for (let i = 0; i < inputs.length; i++) {
//     let file = inputs[i];
//     let token = await uploadOneImage(file); // Không cần `ref`
//     urlImage.push(token);
//   }
//   return urlImage;
// }

// function uploadOneImage(file) {
//   let formData = new FormData(); // FormData để gửi tệp
//   formData.append("file", file);

//   return fetch("https://your-server.com/api/upload", {
//     method: "POST",
//     body: formData,
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Lỗi tải lên tệp.");
//       }
//       return response.json(); // Server trả về URL của tệp đã tải lên
//     })
//     .then((data) => {
//       console.log("File uploaded:", data.url); // `data.url` là URL của tệp
//       return data.url;
//     })
//     .catch((error) => {
//       console.error("Lỗi:", error);
//     });
// }
// const multer = require("multer");
// const sharp = require("sharp");
// const path = require("path");
// const fs = require("fs");
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../public/images/"));
//   },
//   filename: function (req, file, cb) {
//     const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniquesuffix + ".jpeg");
//   },
// });
// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);  // Cho phép file nếu định dạng là ảnh
//   } else {
//     cb({ message: "Unsupported file format" }, false); // Từ chối nếu không phải ảnh
//   }
// };
// const uploadPhoto = multer({
//   storage: storage,
//   fileFilter: multerFilter,
//   limits: { fileSize: 1000000 }, // Giới hạn kích thước tệp tối đa là 1MB (1000000 bytes)
// });
// module.exports = { uploadPhoto };
