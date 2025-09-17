import { Request, Response, NextFunction } from "express";
import * as articleService from "./service/articleService";

export async function createArticle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const article = await articleService.createArticle(req.body);
    res.json({ code: "OK", message: "Tạo bài viết thành công", data: article });
  } catch (err: any) {
    next({ code: "ERR_CREATE_ARTICLE", status: 500, message: err.message });
  }
}

export async function getArticle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const article = await articleService.getArticleById(req.params.id);
    if (!article)
      return next({
        code: "ERR_ARTICLE_NOT_FOUND",
        status: 404,
        message: "Article not found",
      });
    res.json({ code: "OK", data: article });
  } catch (err: any) {
    next({ code: "ERR_GET_ARTICLE", status: 500, message: err.message });
  }
}

export async function updateArticle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const article = await articleService.updateArticle(req.params.id, req.body);
    res.json({
      code: "OK",
      message: "Cập nhật bài viết thành công",
      data: article,
    });
  } catch (err: any) {
    next({ code: "ERR_UPDATE_ARTICLE", status: 500, message: err.message });
  }
}

export async function deleteArticle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await articleService.deleteArticle(req.params.id);
    res.json({ code: "OK", message: "Xóa bài viết thành công" });
  } catch (err: any) {
    next({ code: "ERR_DELETE_ARTICLE", status: 500, message: err.message });
  }
}

export async function getFeaturedArticles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    if (page < 1) page = 1;
    if (limit < 1 || limit > 50) limit = 10;
    const skip = (page - 1) * limit;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const articles = await articleService.getFeaturedArticles(
      skip,
      limit,
      weekAgo
    );
    res.json({
      code: "OK",
      message: "Danh sách bài viết nổi bật",
      data: articles,
      page,
      limit,
    });
  } catch (err: any) {
    next({ code: "ERR_FEATURED_ARTICLE", status: 500, message: err.message });
  }
}
