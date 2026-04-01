const express = require("express");
const router = express.Router();

router.get("/new-endpoint", (req, res) => {
    res.json({ ok: true });
});

router.get("/activities", (req, res) => {
    res.json([]);
});

module.exports = router;