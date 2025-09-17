const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { requireRole } = require("../src/middleware/rbac");

// POST /api/admin/articles/:id/audit
router.post("/articles/:id/audit", requireRole(["admin"]), async (req, res) => {
  res.json({ message: "audit article" });
});

// POST /api/admin/reputation/recalculate
router.post(
  "/reputation/recalculate",
  requireRole(["admin"]),
  async (req, res) => {
    res.json({ message: "recalculate reputation" });
  }
);

// POST /api/admin/judiciary/payouts
router.post("/judiciary/payouts", requireRole(["admin"]), async (req, res) => {
  // Trả coin thưởng cho hội đồng đã xử lý vụ phán quyết
  const { caseId, amount } = req.body;
  const caseRecord = await prisma.judiciaryCase.findUnique({
    where: { id: caseId },
  });
  if (!caseRecord || caseRecord.status !== "resolved")
    return res.status(400).json({ error: "Case not resolved" });
  for (const councilId of caseRecord.councilIds) {
    await prisma.ledger.create({
      data: {
        userId: councilId,
        type: "credit",
        amount,
        ref: "judiciary_payout",
        createdAt: new Date(),
      },
    });
  }
  res.json({ message: "Payouts completed" });
});

module.exports = router;
