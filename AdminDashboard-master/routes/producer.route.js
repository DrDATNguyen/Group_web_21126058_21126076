const express = require("express");
const router = express.Router();

const ProducerController = require("../controllers/producer.controller");

// show list of producers
router.get("/", ProducerController.showListProducer);

// edit producer
router.get("/edit-producer/:id", ProducerController.editProducerGet);

// edit producer post
router.post("/edit-producer", ProducerController.editProducerPost);

// delete producer and product in this producer
router.get("/delete-producer/:id", ProducerController.deleteProducer);

// add new producer
router.get("/add-producer", (req, res) => {
  res.render("producer/add-producer");
});

// post new producer
router.post("/add-producer", ProducerController.addProducerPost);

module.exports = router;
