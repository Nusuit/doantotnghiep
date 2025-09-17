const express = require("express");
const router = express.Router();

// GET/POST /api/notes
router.get("/", async (req, res) => {
  res.json({ message: "list notes" });
});
router.post("/", async (req, res) => {
  res.json({ message: "create note" });
});

// PUT/DELETE /api/notes/:id
router.put("/:id", async (req, res) => {
  res.json({ message: "update note" });
});
router.delete("/:id", async (req, res) => {
  res.json({ message: "delete note" });
});

module.exports = router;
