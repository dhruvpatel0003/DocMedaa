const bcrypt = require("bcryptjs");
const Doctor = require("../models/doctor");
const Patient = require("../models/patient");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail.js");
const JWT_SECRET = process.env.JWT_SECRET || "docmedaa_secret_dummy"; //NEEDS TO UPDATE
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    //NEEDS TO UPDATE
    let user = await Patient.findOne({ email });
    if (!user) {
      user = await Doctor.findOne({ email });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "15m" });

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 1 hour
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    const emailHtml = `
      <h2>Password Reset - DocMedaa</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p>This link is valid for 15 minutes.</p>
    `;

    await sendEmail(user.email, "Reset your DocMedaa password", emailHtml);

    return res.status(200).json({ message: "Reset email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending reset email" });
  }
};

const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, JWT_SECRET);
    let user =
      (await Patient.findById(decoded.id)) ||
      (await Doctor.findById(decoded.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.resetPasswordToken != token)
      return res.status(400).json({ message: "Invalid token" });

    if (user.resetPasswordExpires < Date.now())
      return res.status(400).json({ message: "Token expired" });

    res.status(200).json({ message: "Token valid", userId: user.id });
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);

    //NEEDS TO UPDATE
    let user =
      (await Patient.findById(decoded.id)) ||
      (await Doctor.findById(decoded.id));
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.resetPasswordToken || user.resetPasswordToken !== token) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Password reset failed" });
  }
};

const signup = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      phone,
      age,
      gender,
      address,
      hospitalName,
      hospitalPhone,
      hospitalEmail,
      clinicTimings,
      availableTreatments,
      yearsOfExperience,
      educationLevel,
      licenseNumber,
      specialty,
    } = req.body; //UPDATE FOR THE CONFIRM PASSWORD  LATER
    if (!email || !password || !role)
      return res
        .status(400)
        .json({ message: "email, password and role required" });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    if (role === "Doctor" || role === "doctor") {
      const exists = await Doctor.findOne({ email });
      if (exists)
        return res.status(400).json({ message: "Email already registered" });
      const doc = await Doctor.create({
        fullName,
        email,
        password: hashed,
        role: "Doctor",
        phone,
        age,
        gender,
        address,
        hospitalName,
        hospitalPhone,
        hospitalEmail,
        clinicTimings, //
        availableTreatments, //
        yearsOfExperience,
        educationLevel,
        licenseNumber, //
        specialty,
      });
      return res.status(201).json({
        id: doc._id,
        role: "Doctor",
        message: "Signup successful. Complete profile.",
      });
    } else if (role === "Patient" || role === "patient") {
      const exists = await Patient.findOne({ email });
      if (exists)
        return res.status(400).json({ message: "Email already registered" });
      const pat = await Patient.create({
        fullName,
        email,
        password: hashed,
        role: "Patient",
      });
      return res.status(201).json({
        id: pat._id,
        role: "Patient",
        message: "Signup successful. Complete profile.",
      });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  console.log("Login request bodyyyyyyyyyyyyyyyyyyyyyyy:", req.body);
  try {
    console.log("Inside login controller");
    const { username, password } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "username and password required" });
    let profile;
    let user = await Doctor.findOne({ email: username });
    console.log("doctor userrrrrrrrrrrrrr", user);
    if (user) {
      userType = "Doctor";
      profile = {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role || userType,
        hospitalName: user.hospitalName,
        hospitalPhone: user.hospitalPhone,
        hospitalEmail: user.hospitalEmail,
        clinicTimings: user.clinicTimings,
        availableTreatments: user.availableTreatments,
        yearsOfExperience: user.yearsOfExperience,
        educationLevel: user.educationLevel,
        licenseNumber: user.licenseNumber,
        specialty: user.specialty,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        address: user.address,
      };
    } else {
      user = await Patient.findOne({ email: username });
      console.log("patient userrrrrrrrrrr", user);
      if (user) {
        userType = "Patient";
        profile = {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role || userType,
          phone: user.phone,
          age: user.age,
          healthConditions: user.healthConditions,
          treatments: user.treatments,
          wearableLinkedDevices: user.wearableLinkedDevices,
        };
      }
    }
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken({ id: user._id.toString(), role: userType });
    console.log("Generated token:", token, userType, profile);
    return res.json({ token, profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const completeProfile = async (req, res) => {
  try {
    console.log("Inside completeProfile controller");
    const { role, id } = req.params;
    const payload = req.body;
    // console.log("Payload received:", payload, req.body);
    if (role === "Doctor") {
      const doc = await Doctor.findById(id);
      // console.log("Doctor found:", doc, 'payloadddddd',payload);
      if (!doc) return res.status(404).json({ message: "Doctor not found" });
      const updatable = [
        "fullName",
        "phone",
        "age",
        "gender",
        "address",
        "hospitalName",
        "hospitalPhone",
        "hospitalEmail",
        "clinicTimings",
        "availableTreatments",
        "yearsOfExperience",
        "educationLevel",
        "licenseNumber",
        "specialty",
        "email",
      ];
      // console.log(updatable);
      updatable.forEach((k) => {
        console.log('key',payload[k]);
        if (payload[k] !== undefined) {doc[k] = payload[k];console.log('dockey',doc[k])};
        ;
      });
      await doc.save();
      return res.json({ message: "Profile updated", id: doc._id });
    } else if (role === "Patient") {
      console.log("inside the patient authController", payload);
      const pat = await Patient.findById(id);
      if (
        payload.healthConditions &&
        !Array.isArray(payload.healthConditions)
      ) {
        pat.healthConditions = [...payload.healthConditions];
        console.log("Updated healthConditions:", pat.healthConditions);
      }
      if (!pat) return res.status(404).json({ message: "Patient not found" });
      const updatable = [
        "fullName",
        "phone",
        "age",
        "gender",
        "address",
        "healthConditions",
        "treatments",
        "wearableLinkedDevices",
      ];
      updatable.forEach((k) => {
        if (payload[k] !== undefined) pat[k] = payload[k];
      });
      await pat.save();
      return res.json({ message: "Profile updated", id: pat._id });
    } else {
      return res.status(400).json({ message: "Invalid role param" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  signup,
  login,
  completeProfile,
  forgotPassword,
  verifyResetToken,
  resetPassword,
};
