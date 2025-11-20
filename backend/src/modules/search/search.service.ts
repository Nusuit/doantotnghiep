import { PrismaClient, Article } from '@prisma/client';

const prisma = new PrismaClient();

export class SearchService {
    /**
     * Search articles with filtering and faceting
     */
    async searchArticles(
        query: string,
        filters: {
            tagId?: number;
            categoryId?: number;
            status?: string;
        }
    ) {
        const where: any = {
            status: filters.status || 'PUBLISHED',
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } }
            ]
        };

        if (filters.tagId) {
            where.tags = { some: { id: filters.tagId } };
        }

        if (filters.categoryId) {
            where.categories = { some: { id: filters.categoryId } };
        }

        // Execute search
        const articles = await prisma.article.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        profile: { select: { displayName: true, avatarUrl: true } }
                    }
                },
                tags: true,
                categories: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate facets (counts)
        // Note: This is a simple implementation. For large datasets, use separate count queries.
        const facets = {
            categories: {},
            tags: {}
        };

        // We need to query all matching articles to count facets correctly, 
        // but for now let's just count from the current result set or do a separate aggregation
        // A proper facet query would be:

        const categoryCounts = await prisma.category.findMany({
            where: {
                articles: {
                    some: where
                }
            },
            include: {
                _count: {
                    select: { articles: true }
                }
            }
        });

        const tagCounts = await prisma.tag.findMany({
            where: {
                articles: {
                    some: where
                }
            },
            include: {
                _count: {
                    select: { articles: true }
                }
            }
        });

        return {
            articles,
            facets: {
                categories: categoryCounts.map(c => ({ id: c.id, name: c.name, count: c._count.articles })),
                tags: tagCounts.map(t => ({ id: t.id, name: t.name, count: t._count.articles }))
            }
        };
    }
}
