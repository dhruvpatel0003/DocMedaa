import Doctor from "../models/doctor.js";

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .select('-password') // Exclude password field
            .sort({ fullName: 1 }); // Sort alphabetically by name

        res.status(200).json({
            success: true,
            data: doctors,
            count: doctors.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all doctors grouped by specialty
 * Returns doctors organized by their specialty field
 */
export const getDoctorsBySpecialty = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .select('-password')
            .sort({ specialty: 1, fullName: 1 });

        // Group doctors by specialty
        const doctorsBySpecialty = {};

        doctors.forEach(doctor => {
            const specialty = doctor.specialty || 'General Practice';
            
            if (!doctorsBySpecialty[specialty]) {
                doctorsBySpecialty[specialty] = [];
            }

            doctorsBySpecialty[specialty].push({
                userID: doctor._id.toString(),
                fullName: doctor.fullName,
                email: doctor.email,
                phone: doctor.phone,
                specialty: doctor.specialty,
                yearsOfExperience: doctor.yearsOfExperience,
                highestEducation: doctor.highestEducation,
                hospitalName: doctor.hospitalName,
                hospitalEmail: doctor.hospitalEmail,
                hospitalPhone: doctor.hospitalPhone,
                address: doctor.address,
                availableTreatments: doctor.availableTreatments || [],
                clinicTimings: doctor.clinicTimings || [],
                gender: doctor.gender,
                age: doctor.age,
                license: doctor.license
            });
        });

        res.status(200).json({
            success: true,
            data: doctorsBySpecialty,
            specialties: Object.keys(doctorsBySpecialty),
            totalDoctors: doctors.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get doctors by specific specialty
 * Query parameter: specialty
 */
export const getDoctorsBySpecificSpecialty = async (req, res) => {
    try {
        const { specialty } = req.query;

        if (!specialty) {
            return res.status(400).json({
                success: false,
                message: "Specialty parameter is required"
            });
        }

        // Case-insensitive search for specialty
        const doctors = await Doctor.find({
            specialty: { $regex: new RegExp(specialty, 'i') }
        })
            .select('-password')
            .sort({ fullName: 1 });

        res.status(200).json({
            success: true,
            specialty: specialty,
            data: doctors,
            count: doctors.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all unique specialties
 * Returns a list of all unique specialties in the system
 */
export const getAllSpecialties = async (req, res) => {
    try {
        const specialties = await Doctor.distinct('specialty');
        
        // Filter out null/undefined values
        const validSpecialties = specialties.filter(s => s && s.trim() !== '');

        res.status(200).json({
            success: true,
            data: validSpecialties.sort(),
            count: validSpecialties.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get doctor by ID
 * Returns complete information about a specific doctor
 */
export const getDoctorById = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const doctor = await Doctor.findById(doctorId).select('-password');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                userID: doctor._id.toString(),
                fullName: doctor.fullName,
                role: 'Doctor',
                email: doctor.email,
                phone: doctor.phone,
                address: doctor.address,
                age: doctor.age,
                gender: doctor.gender,
                specialty: doctor.specialty,
                yearsOfExperience: doctor.yearsOfExperience,
                highestEducation: doctor.highestEducation,
                license: doctor.license,
                hospitalName: doctor.hospitalName,
                hospitalEmail: doctor.hospitalEmail,
                hospitalPhone: doctor.hospitalPhone,
                availableTreatments: doctor.availableTreatments || [],
                clinicTimings: doctor.clinicTimings || [],
                treatments: doctor.treatments || [],
                bookmarks: doctor.bookmarks || [],
                healthConditions: doctor.healthConditions || [],
                wearableLinkedDevices: doctor.wearableLinkedDevices || []
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Search doctors by name, specialty, or hospital
 */
export const searchDoctors = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const searchRegex = new RegExp(query, 'i');

        const doctors = await Doctor.find({
            $or: [
                { fullName: searchRegex },
                { specialty: searchRegex },
                { hospitalName: searchRegex },
                { availableTreatments: searchRegex }
            ]
        })
            .select('-password')
            .sort({ fullName: 1 });

        res.status(200).json({
            success: true,
            data: doctors,
            count: doctors.length,
            searchQuery: query
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
