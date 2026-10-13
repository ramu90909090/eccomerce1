const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["user", "manager", "admin"], 
      default: "user" 
    },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// ✅ Clean Async Hook (Bina next argument ke - Mongoose 7/8/9 compatible)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Password compare method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);