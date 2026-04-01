const express = require("express");
const app = express();

app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", checkedAt: Date.now() });
});

app.use('/api', require('./routes/api'));

app.listen(3000, () => console.log("VitalSync API on :3000"));