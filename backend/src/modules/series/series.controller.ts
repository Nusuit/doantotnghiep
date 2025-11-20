import { Request, Response } from 'express';
import { SeriesService } from './series.service';

const seriesService = new SeriesService();

export class SeriesController {
    async create(req: Request, res: Response) {
        try {
            const authorId = (req as any).user?.id;
            if (!authorId) return res.status(401).json({ message: 'Unauthorized' });

            const series = await seriesService.createSeries(Number(authorId), req.body);
            res.status(201).json(series);
        } catch (error) {
            console.error('Create series error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async addArticle(req: Request, res: Response) {
        try {
            const seriesId = Number(req.params.id);
            const { articleId, order } = req.body;

            // TODO: Check ownership of series

            const result = await seriesService.addArticleToSeries(seriesId, articleId, order);
            res.json(result);
        } catch (error) {
            console.error('Add article to series error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getOne(req: Request, res: Response) {
        try {
            const series = await seriesService.getSeries(Number(req.params.id));
            if (!series) return res.status(404).json({ message: 'Series not found' });
            res.json(series);
        } catch (error) {
            console.error('Get series error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
