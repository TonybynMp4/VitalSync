const express = require("express");
const router = express.Router();

router.get("/api/new-endpoint", (req, res) => {
    res.json({ ok: true });
});

router.get("/api/activities", (req, res) => {
    res.json([]);
});

module.exports = router;