
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Content = require("./models/Content");

const contents = [
  {
    title: "Pentingnya Menjaga Pola Tidur",
    type: "article",
    category: "Sleep",
    description: "Kenali manfaat tidur yang cukup bagi kesehatan tubuh dan pikiran.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
    content: "Tidur yang cukup membantu tubuh memulihkan energi, menjaga konsentrasi, dan mendukung kesehatan mental. Usahakan tidur selama 7–9 jam setiap malam dan pertahankan jadwal tidur yang teratur."
  },
  {
    title: "Tips Memulai Hidup Sehat",
    type: "article",
    category: "Healthy Lifestyle",
    description: "Langkah sederhana untuk membangun kebiasaan sehat setiap hari.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
    content: "Mulailah dengan minum air putih yang cukup, mengonsumsi makanan bergizi, bergerak secara rutin, dan menjaga waktu istirahat."
  },
  {
    title: "Manfaat Minum Air Putih",
    type: "article",
    category: "Hydration",
    description: "Mengapa menjaga hidrasi penting untuk tubuh?",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800",
    content: "Air membantu mengatur suhu tubuh, mendukung pencernaan, dan menjaga fungsi organ. Kebutuhan air setiap orang dapat berbeda."
  },
  {
    title: "Morning Yoga for Beginners",
    type: "video",
    category: "Yoga",
    description: "Gerakan yoga ringan untuk memulai hari dengan lebih segar.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
    videoUrl: "",
    duration: "15 menit"
  },
  {
    title: "Daily Stretching Routine",
    type: "video",
    category: "Stretching",
    description: "Rangkaian peregangan sederhana untuk membantu tubuh lebih rileks.",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
    videoUrl: "",
    duration: "10 menit"
  },
  {
    title: "Full Body Stretching",
    type: "workout",
    category: "Stretching",
    description: "Latihan peregangan seluruh tubuh yang cocok untuk pemula.",
    image: "https://images.unsplash.com/photo-1562088287-bde35a1ea917?w=800",
    duration: "15 menit"
  },
  {
    title: "Beginner Pilates",
    type: "workout",
    category: "Pilates",
    description: "Latihan pilates dasar untuk melatih kekuatan dan keseimbangan tubuh.",
    image: "https://images.unsplash.com/photo-1510894347719-fc7e8e5f6c1d?w=800",
    duration: "20 menit"
  },
  {
    title: "Mengenal Gizi Seimbang",
    type: "nutrition",
    category: "Nutrition",
    description: "Panduan dasar memilih makanan bergizi dan seimbang.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
    content: "Pola makan seimbang mencakup sumber karbohidrat, protein, sayuran, buah, serta lemak sehat. Variasikan makanan sesuai kebutuhan tubuh."
  },
  {
    title: "Pilihan Camilan Sehat",
    type: "nutrition",
    category: "Healthy Food",
    description: "Inspirasi camilan bergizi untuk menemani aktivitas sehari-hari.",
    image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800",
    content: "Buah segar, yoghurt, kacang-kacangan, dan telur rebus dapat menjadi pilihan camilan yang bernutrisi."
  }
];

const seedData = async () => {
  try {
    await connectDB();

    for (const item of contents) {
      await Content.findOneAndUpdate(
        { title: item.title },
        item,
        { upsert: true, new: true, runValidators: true }
      );
    }

    console.log("Moodaily content berhasil dimasukkan!");
    console.log(`Total konten: ${contents.length}`);
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

seedData();
