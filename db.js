const mongoose = require('mongoose');

const db = () => {
    mongoose.connect('mongodb+srv://belk:belk2024@cluster0.wec4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        .then(() => {
            console.log("MongoDB connected");
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
        });
};

module.exports = db;
