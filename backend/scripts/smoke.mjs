import http from "node:http";
import https from "node:https";

const API_BASE = process.env.API_BASE || "http://127.0.0.1:4000";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requestJson(path, options = {}) {
  const url = new URL(path, API_BASE);
  const lib = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const req = lib.request(
      url,
      {
        method: options.method || "GET",
        headers: {
          ...(options.headers || {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let body;
          try {
            body = text ? JSON.parse(text) : {};
          } catch {
            body = { _raw: text };
          }
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body,
          });
        });
      }
    );
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

function randomEmail() {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, "");
  return `smoke_${ts}@example.com`;
}

async function main() {
  // health
  {
    const { status, body } = await requestJson("/api/health");
    assert(status === 200, `health status ${status}`);
    assert(body.status === "ok", "health body not ok");
  }

  // ready
  {
    const { status, body } = await requestJson("/api/ready");
    assert([200, 503].includes(status), `ready status ${status}`);
    assert(body.status, "ready missing status");
    assert(body.status === "ok", "ready not ok (DB not reachable?)");
  }

  // auth register/login/me
  const email = randomEmail();
  const password = "Password123!";
  {
    const { status, body } = await requestJson("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, displayName: "Smoke Test" }),
    });
    assert(status === 201, `register status ${status}`);
    assert(body?.success === true, "register success=false");
    assert(typeof body?.token === "string" && body.token.length > 20, "missing token");
  }

  let token;
  {
    const { status, body } = await requestJson("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    assert(status === 200, `login status ${status}`);
    assert(body?.success === true, "login success=false");
    token = body.token;
    assert(typeof token === "string" && token.length > 20, "missing token");
  }

  {
    const { status, body } = await requestJson("/api/auth/me", {
      headers: { authorization: `Bearer ${token}` },
    });
    assert(status === 200, `me status ${status}`);
    assert(body?.email === email, "me.email mismatch");
  }

  // restaurants list (public)
  {
    const { status, body } = await requestJson("/api/restaurants?limit=5&offset=0");
    assert(status === 200, `restaurants status ${status}`);
    assert(body?.success === true, "restaurants success=false");
    assert(Array.isArray(body?.data?.restaurants), "restaurants missing array");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        apiBase: API_BASE,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, apiBase: API_BASE, error: err.message }, null, 2));
  process.exit(1);
});
