import { PrismaClient, Article, ArticleHistory, Tag, Category } from '@prisma/client';

const prisma = new PrismaClient();

export class ArticleService {
    /**
     * Create a new article with tags and categories
     */
    async createArticle(authorId: number, data: {
        title: string;
        content: string;
        slug: string;
        tagIds?: number[];
        categoryIds?: number[];
        coverImage?: string;
    }): Promise<Article> {
        const { tagIds, categoryIds, ...articleData } = data;

        return prisma.article.create({
            data: {
                ...articleData,
                authorId,
                tags: tagIds ? {
                    connect: tagIds.map(id => ({ id }))
                } : undefined,
                categories: categoryIds ? {
                    connect: categoryIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                tags: true,
                categories: true
            }
        });
    }

    /**
     * Update an article and create a history record
     */
    async updateArticle(
        articleId: number,
        editorId: number,
        data: {
            title?: string;
            content?: string;
            changeNote?: string;
            tagIds?: number[];
            categoryIds?: number[];
        }
    ): Promise<Article> {
        // 1. Get current article state for history
        const currentArticle = await prisma.article.findUnique({
            where: { id: articleId }
        });

        if (!currentArticle) {
            throw new Error('Article not found');
        }

        // 2. Create history record if content or title changed
        if ((data.title && data.title !== currentArticle.title) ||
            (data.content && data.content !== currentArticle.content)) {
            await prisma.articleHistory.create({
                data: {
                    articleId,
                    editorId,
                    title: currentArticle.title,
                    content: currentArticle.content,
                    changeNote: data.changeNote || 'Updated article'
                }
            });
        }

        // 3. Update article
        const { tagIds, categoryIds, changeNote, ...updateData } = data;

        return prisma.article.update({
            where: { id: articleId },
            data: {
                ...updateData,
                tags: tagIds ? {
                    set: tagIds.map(id => ({ id }))
                } : undefined,
                categories: categoryIds ? {
                    set: categoryIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                tags: true,
                categories: true,
                history: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });
    }

    /**
     * Get article by Slug
     */
    async getArticleBySlug(slug: string) {
        return prisma.article.findUnique({
            where: { slug },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: { displayName: true, avatarUrl: true }
                        }
                    }
                },
                tags: true,
                categories: true,
                history: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: {
                        editor: {
                            select: {
                                id: true,
                                profile: { select: { displayName: true } }
                            }
                        }
                    }
                }
            }
        });
    }
}
