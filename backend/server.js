const express = require("express");
const app = express();
app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", checkedAt: Date.now() });
});
app.get("/api/activities", (req, res) => {
    res.json([]);
});
app.listen(3000, () => console.log("VitalSync API on :3000"));