import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const createAdmin = async () => {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = new User({
    name: "Admin",
    email: "admin@example.com",
    password: hashedPassword,
    role: "admin",
  });

  await admin.save();
  console.log("Admin created successfully");
  mongoose.disconnect();
};

createAdmin();
