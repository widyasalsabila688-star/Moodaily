
const Activity = require("../models/Activity");
const User = require("../models/User");

// GET ACTIVITIES
const getActivities = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan.",
      });
    }

    const activities = await Activity.find({ user: user._id })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      total: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE ACTIVITY
const createActivity = async (req, res) => {
  try {
    const { userId, activityName, category, duration, calories } = req.body;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan.",
      });
    }

    if (!activityName || !duration) {
      return res.status(400).json({
        success: false,
        message: "Nama aktivitas dan durasi wajib diisi.",
      });
    }

    const activity = await Activity.create({
      user: user._id,
      activityName,
      category,
      duration,
      calories,
    });

    res.status(201).json({
      success: true,
      message: "Aktivitas berhasil disimpan!",
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getActivities, createActivity };
