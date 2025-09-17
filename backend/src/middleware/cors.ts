import cors from "cors";

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

export default cors({
  origin: allowedOrigins,
  credentials: true,
});
