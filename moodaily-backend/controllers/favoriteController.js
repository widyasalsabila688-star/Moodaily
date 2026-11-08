
const Favorite = require("../models/Favorite");
const User = require("../models/User");

// GET FAVORITES
const getFavorites = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan.",
      });
    }

    const favorites = await Favorite.find({ user: user._id })
      .populate("content")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: favorites.length,
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADD FAVORITE
const addFavorite = async (req, res) => {
  try {
    const { userId, content } = req.body;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan.",
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "ID konten wajib diisi.",
      });
    }

    const favorite = await Favorite.create({
      user: user._id,
      content,
    });

    res.status(201).json({
      success: true,
      message: "Konten berhasil ditambahkan ke favorit!",
      data: favorite,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Konten sudah ada di favorit.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REMOVE FAVORITE
const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findByIdAndDelete(req.params.id);

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorit tidak ditemukan.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Favorit berhasil dihapus!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };
