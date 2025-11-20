import { Request, Response } from 'express';
import { SearchService } from './search.service';

const searchService = new SearchService();

export class SearchController {
    async search(req: Request, res: Response) {
        try {
            const { q, tagId, categoryId } = req.query;
            const query = q ? String(q) : '';

            const result = await searchService.searchArticles(query, {
                tagId: tagId ? Number(tagId) : undefined,
                categoryId: categoryId ? Number(categoryId) : undefined
            });

            res.json(result);
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
