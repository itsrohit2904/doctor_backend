const jwt = require('jsonwebtoken');
const appointmentModel = require('../models/appointmentModel.js');
const doctorModel = require('../models/doctorModel.js');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { v2: cloudinary } = require('cloudinary'); 
const userModel = require('../models/userModel.js');

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) { 
            const token = jwt.sign({ email, password }, process.env.JWT_SECRET); // Use a more secure payload (e.g., admin ID)
            res.json({ success: true, token }); 
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" }); 
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({});
        res.json({ success: true, appointments });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body;

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" }); 
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        res.json({ success: true, message: 'Appointment Cancelled' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API for adding Doctor
const addDoctor = async (req, res) => {
    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        // Input Validation
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt);

        // Upload image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword, 
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        };

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.status(201).json({ success: true, message: 'Doctor Added' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password'); 
        res.json({ success: true, doctors });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({});

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        };

        res.json({ success: true, dashData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    allDoctors,
    adminDashboard
};