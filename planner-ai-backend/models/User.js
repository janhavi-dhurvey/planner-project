import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* =========================================
   USER SCHEMA
========================================= */

const UserSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  }

},
{
  timestamps: true
}
);

/* =========================================
   PRE-SAVE HOOK
   - normalize email
   - hash password
========================================= */

UserSchema.pre("save", async function () {

  /* normalize email */
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }

  /* hash password only if modified */
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});

/* =========================================
   COMPARE PASSWORD (LOGIN)
========================================= */

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* =========================================
   REMOVE PASSWORD FROM JSON OUTPUT
========================================= */

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

/* =========================================
   EXPORT MODEL
========================================= */

const User =
mongoose.models.User ||
mongoose.model("User", UserSchema);

export default User;