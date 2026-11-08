
const express = require("express");
const router = express.Router();

const {
  getContents,
  getContentById,
  createContent,
} = require("../controllers/contentController");

router.get("/", getContents);
router.get("/:id", getContentById);
router.post("/", createContent);

module.exports = router;
