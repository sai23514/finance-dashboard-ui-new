const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

// ➕ CREATE
router.post("/", auth, async (req, res) => {
  try {
    const newTransaction = new Transaction({
      ...req.body,
      userId: req.user.id
    });

    const saved = await newTransaction.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 📥 READ
router.get("/", auth, async (req, res) => {
  try {
    const data = await Transaction.find({
      userId: req.user.id
    }).sort({ date: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ❌ DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// ✏️ UPDATE (for next feature)
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;