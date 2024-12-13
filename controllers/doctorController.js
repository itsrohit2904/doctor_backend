const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const doctorModel = require('../models/doctorModel.js');
const appointmentModel = require('../models/appointmentModel.js');

// API for doctor Login
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;

        const doctor = await doctorModel.findOne({ email }); 

        if (!doctor) {
            return res.status(401).json({ success: false, message: "Invalid credentials" }); 
        }

        const isMatch = await bcrypt.compare(password, doctor.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET); 
        res.status(200).json({ success: true, token }); 

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {
        const { docId } = req.body; 

        const appointments = await appointmentModel.find({ docId }); 
        res.json({ success: true, appointments });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData || appointmentData.docId !== docId) { 
            return res.status(400).json({ success: false, message: "Invalid appointment or unauthorized access" });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        res.json({ success: true, message: 'Appointment Cancelled' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData || appointmentData.docId !== docId) { 
            return res.status(400).json({ success: false, message: "Invalid appointment or unauthorized access" });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });

        res.json({ success: true, message: 'Appointment Completed' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get all doctors list for Frontend
const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password -__v'); // Exclude password and __v field
        res.json({ success: true, doctors });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to change doctor availablity for Admin and Doctor Panel
const changeAvailablity = async (req, res) => {
    try {
        const { docId } = req.body;

        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available }); 

        res.json({ success: true, message: 'Availablity Changed' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get doctor profile for Doctor Panel
const doctorProfile = async (req, res) => {
    try {
        const { docId } = req.body;
        const profileData = await doctorModel.findById(docId).select('-password -__v'); 

        res.json({ success: true, profileData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to update doctor profile data from Doctor Panel
const updateDoctorProfile = async (req, res) => {
    try {
        const { docId, fees, address, available } = req.body;

        await doctorModel.findByIdAndUpdate(docId, { fees, address, available });

        res.json({ success: true, message: 'Profile Updated' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body;

        const appointments = await appointmentModel.find({ docId });

        let earnings = 0;
        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount;
            }
        });

        let patients = [];
        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId);
            }
        });

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse()
        };

        res.json({ success: true, dashData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports= {
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    doctorList,
    changeAvailablity,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile
};