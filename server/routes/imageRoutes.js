const express = require("express");
const multer = require("multer");
const { uploadImage } = require("../services/cloudinaryService");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await uploadImage(req.file.path);

    res.json({
      success: true,
      imageUrl: result.secure_url,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;