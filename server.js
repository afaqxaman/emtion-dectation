require("dotenv").config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from "public" folder
app.use(express.static("public"));

// Setup multer to receive uploaded images in memory
const upload = multer({ storage: multer.memoryStorage() });

// POST endpoint to receive image
app.post("/detect", upload.single("photo"), async (req, res) => {
  try {
    // Get image buffer from uploaded file
    const imageBuffer = req.file.buffer;

    // Prepare form-data for Face++ API
    const form = new FormData();
    form.append("api_key", process.env.API_KEY);
    form.append("api_secret", process.env.API_SECRET);
    form.append("image_base64", imageBuffer.toString("base64"));
    form.append("return_attributes", "emotion");

    // Send POST request to Face++ API
    const response = await axios.post(
      "https://api-us.faceplusplus.com/facepp/v3/detect",
      form,
      { headers: form.getHeaders() }
    );

    // Return API response to frontend
    return res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Detection failed" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
