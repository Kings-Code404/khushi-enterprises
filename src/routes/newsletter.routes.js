const express = require("express");
const { subscribe, unsubscribe } = require("../controllers/newsletter.controller");
const router = express.Router();
router.post("/subscribe", subscribe);
router.delete("/unsubscribe", unsubscribe);
module.exports = router;
