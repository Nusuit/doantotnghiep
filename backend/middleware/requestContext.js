const crypto = require("crypto");

function requestContext() {
  return function requestContextMiddleware(req, res, next) {
    const incoming = req.headers["x-request-id"];
    const requestId =
      (typeof incoming === "string" && incoming.trim()) ||
      (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex"));

    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);

    const start = process.hrtime.bigint();
    res.on("finish", () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      const line = JSON.stringify({
        level: "info",
        type: "http",
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Math.round(ms * 10) / 10,
      });
      // eslint-disable-next-line no-console
      console.log(line);
    });

    next();
  };
}

module.exports = {
  requestContext,
};
