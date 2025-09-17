import auditLogger from "../../middleware/auditLog";

export function logWalletAction(
  userId: string,
  action: string,
  amount: number,
  ref: string
) {
  auditLogger.info({
    module: "wallet",
    userId,
    action,
    amount,
    ref,
    timestamp: new Date().toISOString(),
  });
}
