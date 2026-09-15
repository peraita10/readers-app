import express, { type Express } from "express";
import { jwtVerify } from "jose";

export const app: Express = express();

app.use(express.json());

const targets = {
  identity:
    process.env.IDENTITY_SERVICE_URL ?? "http://localhost:3001",
  catalog:
    process.env.CATALOG_SERVICE_URL ?? "http://localhost:3002",
  reading:
    process.env.READING_SERVICE_URL ?? "http://localhost:3003",
  community:
    process.env.COMMUNITY_SERVICE_URL ?? "http://localhost:3004",
};

const secret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ??
      "development-only-change-me-please-32chars",
  );

async function proxy(
  req: any,
  res: any,
  target: string,
  path: string,
  auth = false,
) {
  try {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };

    if (auth) {
      const rawToken = req
        .header("authorization")
        ?.replace(/^Bearer /, "");

      if (!rawToken) {
        return res.sendStatus(401);
      }

      const { payload } = await jwtVerify(rawToken, secret());

      if (!payload.sub) {
        return res.sendStatus(401);
      }

      headers["x-user-id"] = payload.sub;
    }

    const response = await fetch(target + path, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : JSON.stringify(req.body),
    });

    res.status(response.status);

    const text = await response.text();

    res
      .type(
        response.headers.get("content-type") ??
          "application/json",
      )
      .send(text);
  } catch {
    res.status(502).json({
      error: {
        code: "UPSTREAM_UNAVAILABLE",
        message: "Service unavailable",
      },
    });
  }
}

app.get("/health", (_req, res) => {
  res.json({
    service: "gateway",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/*
 * Authentication
 * Identity owns authentication.
 */
app.use("/api/v1/auth", (req, res) =>
  proxy(
    req,
    res,
    targets.identity,
    "/api/v1/auth" + req.url,
  ),
);

/*
 * User social actions
 * Community owns relationships between users.
 *
 * These routes MUST be declared before the generic
 * /api/v1/users route below.
 */
app.post("/api/v1/users/:id/follow", (req, res) =>
  proxy(
    req,
    res,
    targets.community,
    `/api/v1/users/${req.params.id}/follow`,
    true,
  ),
);

app.delete("/api/v1/users/:id/follow", (req, res) =>
  proxy(
    req,
    res,
    targets.community,
    `/api/v1/users/${req.params.id}/follow`,
    true,
  ),
);

app.post("/api/v1/users/:id/block", (req, res) =>
  proxy(
    req,
    res,
    targets.community,
    `/api/v1/users/${req.params.id}/block`,
    true,
  ),
);

/*
 * Public user profiles
 * Identity owns the user/profile itself.
 */
app.use("/api/v1/users", (req, res) =>
  proxy(
    req,
    res,
    targets.identity,
    "/api/v1/users" + req.url,
  ),
);

/*
 * Reading endpoints associated with books.
 *
 * Reviews belong to Reading.
 * Catalog information belongs to Catalog.
 */
app.use("/api/v1/books", (req, res) => {
  const isReviewOperation =
    req.path.includes("/review");

  const isCommunityOperation =
    req.path.includes("/events");

  let target = targets.catalog;
  let auth = false;

  if (isReviewOperation) {
    target = targets.reading;
    auth = true;
  }

  if (isCommunityOperation) {
    target = targets.community;
    auth = true;
  }

  return proxy(
    req,
    res,
    target,
    "/api/v1/books" + req.url,
    auth,
  );
});

/*
 * Personal library
 */
app.use("/api/v1/me", (req, res) =>
  proxy(
    req,
    res,
    targets.reading,
    "/api/v1/me" + req.url,
    true,
  ),
);

/*
 * Review interactions
 */
app.use("/api/v1/reviews", (req, res) =>
  proxy(
    req,
    res,
    targets.reading,
    "/api/v1/reviews" + req.url,
    true,
  ),
);

/*
 * Recommendation boundary.
 *
 * Today this points to Reading.
 * In the future this can be redirected to an independent
 * recommendation / ML service without changing the public API.
 */
app.use("/api/v1/recommendations", (req, res) =>
  proxy(
    req,
    res,
    targets.reading,
    "/api/v1/recommendations" + req.url,
    true,
  ),
);

/*
 * Community domain
 */
for (const prefix of [
  "groups",
  "events",
  "challenges",
  "feed",
  "reports",
]) {
  app.use(`/api/v1/${prefix}`, (req, res) =>
    proxy(
      req,
      res,
      targets.community,
      `/api/v1/${prefix}` + req.url,
      true,
    ),
  );
}