const mongoose = require("mongoose");
const adminModel = require("../models/Admin");

const getAdminData = async (req, res) => {
  try {
    const { admin } = req; // ✅ Extracted from middleware
    console.log("Admin Email from Middleware:", admin.email);

    if (!admin || !admin.email) {
      return res.status(400).json({ success: false, message: "Admin email is required" });
    }

    const foundAdmin = await adminModel.findOne({ email: admin.email });

    if (!foundAdmin) {
      return res.status(404).json({ success: false, message: "Admin Not Found" });
    }

    return res.status(200).json({
      success: true,
      adminData: {
        name: foundAdmin.name,
        email: foundAdmin.email,
        isAccountVerified: foundAdmin.isAccountVerified,
      },
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching admin data",
    });
  }
};

module.exports = getAdminData;
