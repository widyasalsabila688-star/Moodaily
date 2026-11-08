require("dotenv").config();
const mongoose = require("mongoose");

async function updateUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = mongoose.connection.collection("users");

    const result = await users.updateOne(
      { email: "widya.test@gmail.com" },
      { $set: { userId: "USR001" } }
    );

    console.log("Hasil update:", result);
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

updateUser();
