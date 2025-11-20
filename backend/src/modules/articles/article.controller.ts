import { Request, Response } from 'express';
import { ArticleService } from './article.service';

const articleService = new ArticleService();

export class ArticleController {
    async create(req: Request, res: Response) {
        try {
            const authorId = (req as any).user?.id;
            if (!authorId) return res.status(401).json({ message: 'Unauthorized' });

            const article = await articleService.createArticle(Number(authorId), req.body);
            res.status(201).json(article);
        } catch (error) {
            console.error('Create article error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const editorId = (req as any).user?.id;
            if (!editorId) return res.status(401).json({ message: 'Unauthorized' });

            const articleId = Number(req.params.id);
            const article = await articleService.updateArticle(articleId, Number(editorId), req.body);
            res.json(article);
        } catch (error) {
            console.error('Update article error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getBySlug(req: Request, res: Response) {
        try {
            const article = await articleService.getArticleBySlug(req.params.slug);
            if (!article) return res.status(404).json({ message: 'Article not found' });
            res.json(article);
        } catch (error) {
            console.error('Get article error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
