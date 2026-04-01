const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", checkedAt: Date.now() });
});

router.get("/new-endpoint", (req, res) => {
    res.json({ ok: true });
});

router.get("/activities", (req, res) => {
    res.json([]);
});

module.exports = router;