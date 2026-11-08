const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.userId) {
    const lastUser = await mongoose
      .model("User")
      .findOne({ userId: /^USR\d+$/ })
      .sort({ userId: -1 });

    const nextNumber = lastUser
      ? parseInt(lastUser.userId.replace("USR", ""), 10) + 1
      : 1;

    this.userId = `USR${String(nextNumber).padStart(3, "0")}`;
  }
});

module.exports = mongoose.model("User", userSchema);