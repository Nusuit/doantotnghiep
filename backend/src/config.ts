import dotenv from "dotenv";
dotenv.config();

export const config = {
  COIN_SUGGESTION: Number(process.env.COIN_SUGGESTION) || 10,
  COIN_PREMIUM: Number(process.env.COIN_PREMIUM) || 150,
  COIN_UNLOCK: Number(process.env.COIN_UNLOCK) || 50,
  COIN_HOLD: Number(process.env.COIN_HOLD) || 50,
  SUGGESTION_REWARD: Number(process.env.SUGGESTION_REWARD) || 20,
  HOLD_EXPIRE_HOURS: Number(process.env.HOLD_EXPIRE_HOURS) || 72,
  PAGINATION_LIMIT: Number(process.env.PAGINATION_LIMIT) || 20,
  JWT_SECRET: process.env.JWT_SECRET || "changeme",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  DOMAIN: process.env.DOMAIN || "http://localhost:5000",
  // ...thêm các config khác nếu cần
};

export const messages = {
  ERR_NOT_ENOUGH_COIN: "Bạn không đủ coin để thực hiện thao tác này.",
  ERR_SUGGESTION_EXISTS: "Bạn đã gửi đề xuất cho bài này, hãy chờ xử lý.",
  ERR_SUGGESTION_TOO_FAST: "Bạn gửi đề xuất quá nhanh, hãy thử lại sau.",
  OK_CREATE_ARTICLE: "Tạo bài viết thành công.",
  OK_UPDATE_ARTICLE: "Cập nhật bài viết thành công.",
  OK_DELETE_ARTICLE: "Xóa bài viết thành công.",
  // ...thêm các message khác nếu cần
};
