const Doctor = require("../models/doctor");
const Patient = require("../models/patient");

exports.getUserProfileById = async (req, res) => {
  try {
    console.log("Fetching user profile for ID:", req.params.id);
    const { id } = req.params;
    let user = await Patient.findById(id).lean();
    if (!user) {
      user = await Doctor.findById(id).lean();
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Optionally remove sensitive fields
    delete user.password;
    console.log("User profile found:", user); 
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
