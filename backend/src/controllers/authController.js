const bcrypt = require('bcryptjs');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
const generateToken = require('../utils/generateToken');

const SALT_ROUNDS = 10;

const signup = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'email, password and role required' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    if (role === 'Doctor') {
      const exists = await Doctor.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });
      const doc = await Doctor.create({ fullName, email, password: hashed, role: 'Doctor' });
      return res.status(201).json({ id: doc._id, role: 'Doctor', message: 'Signup successful. Complete profile.' });
    } else if (role === 'Patient') {
      const exists = await Patient.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });
      const pat = await Patient.create({ fullName, email, password: hashed, role: 'Patient' });
      return res.status(201).json({ id: pat._id, role: 'Patient', message: 'Signup successful. Complete profile.' });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });

    let user = await Doctor.findOne({ email: username });
    let userType = 'Doctor';
    if (!user) {
      user = await Patient.findOne({ email: username });
      userType = 'Patient';
    }
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ id: user._id.toString(), role: userType });
    const profile = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role || userType
    };
    return res.json({ token, profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const completeProfile = async (req, res) => {
  try {
    const { role, id } = req.params;
    const payload = req.body;

    if (role === 'Doctor') {
      const doc = await Doctor.findById(id);
      if (!doc) return res.status(404).json({ message: 'Doctor not found' });
      const updatable = [
        'fullName','phone','age','gender','address',
        'hospitalName','hospitalPhone','hospitalEmail',
        'clinicTimings','availableTreatments','yearsOfExperience',
        'educationLevel','licenseNumber','specialty'
      ];
      updatable.forEach(k => { if (payload[k] !== undefined) doc[k] = payload[k]; });
      await doc.save();
      return res.json({ message: 'Profile updated', id: doc._id });
    } else if (role === 'Patient') {
      const pat = await Patient.findById(id);
      if (!pat) return res.status(404).json({ message: 'Patient not found' });
      const updatable = ['fullName','phone','age','gender','address','healthConditions','treatments','wearableLinkedDevices'];
      updatable.forEach(k => { if (payload[k] !== undefined) pat[k] = payload[k]; });
      await pat.save();
      return res.json({ message: 'Profile updated', id: pat._id });
    } else {
      return res.status(400).json({ message: 'Invalid role param' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { signup, login, completeProfile };
