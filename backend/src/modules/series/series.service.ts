import { PrismaClient, Series, SeriesArticle } from '@prisma/client';

const prisma = new PrismaClient();

export class SeriesService {
    /**
     * Create a new series
     */
    async createSeries(authorId: number, data: {
        title: string;
        description?: string;
    }): Promise<Series> {
        return prisma.series.create({
            data: {
                ...data,
                authorId
            }
        });
    }

    /**
     * Add an article to a series
     */
    async addArticleToSeries(seriesId: number, articleId: number, order?: number): Promise<SeriesArticle> {
        // If order is not provided, put it at the end
        let targetOrder = order;
        if (targetOrder === undefined) {
            const lastItem = await prisma.seriesArticle.findFirst({
                where: { seriesId },
                orderBy: { order: 'desc' }
            });
            targetOrder = (lastItem?.order || 0) + 1;
        }

        return prisma.seriesArticle.create({
            data: {
                seriesId,
                articleId,
                order: targetOrder
            }
        });
    }

    /**
     * Get series with articles
     */
    async getSeries(id: number) {
        return prisma.series.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        profile: { select: { displayName: true, avatarUrl: true } }
                    }
                },
                articles: {
                    orderBy: { order: 'asc' },
                    include: {
                        article: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });
    }
}
