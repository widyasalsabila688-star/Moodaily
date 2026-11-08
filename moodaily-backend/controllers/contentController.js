
const Content = require("../models/Content");

// GET ALL CONTENT
const getContents = async (req, res) => {
  try {
    const { type } = req.query;

    const filter = type ? { type } : {};

    const contents = await Content.find(filter).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      total: contents.length,
      data: contents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET CONTENT BY ID
const getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Konten tidak ditemukan.",
      });
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE CONTENT
const createContent = async (req, res) => {
  try {
    const content = await Content.create(req.body);

    res.status(201).json({
      success: true,
      message: "Konten berhasil ditambahkan!",
      data: content,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getContents,
  getContentById,
  createContent,
};
