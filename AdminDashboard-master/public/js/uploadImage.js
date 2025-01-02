async function upload(str) {
  const ref = firebase.storage().ref();
  let urlImage = [];
  var inputs = document.querySelector(str).files;
  console.log(inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    //deal with each input
    let file = inputs[i];
    let token = await uploadOneImage(file, ref);
    urlImage.push(token);
  }
  return urlImage;
}

function uploadOneImage(file, ref) {
  let metaData = {
    contentType: file.type,
  };
  let name = file.name;
  let uploadImage = ref.child(name).put(file, metaData);

  let urlImage = "";

  return uploadImage
    .then((snapshot) => snapshot.ref.getDownloadURL())
    .then((url) => {
      urlImage = url;
      console.log(urlImage);
      return urlImage;
    })
    .catch((error) => {
      console.log(error);
    });
}
