import { getPrisma } from "../../db/prisma";
import { ArticleStatus, ArticleType } from "@prisma/client";

export interface CreateArticleInput {
    title: string;
    content: string;
    type?: ArticleType;
    categoryId: number;
    authorId: number;
    status?: ArticleStatus;
    locationContext?: {
        name: string;
        address: string;
        latitude: number;
        longitude: number;
    };
    contextId?: number;
    url?: string;
}

export class ArticleService {
    static async createArticle(input: CreateArticleInput) {
        const prisma = getPrisma();

        // Generate slug from title
        const slug = input.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // Create a unique slug by appending timestamp if needed
        const uniqueSlug = `${slug}-${Date.now()}`;

        // If we have an existing context ID, use it. Otherwise, create a new context.
        let contextId: number | undefined;
        if (input.contextId) {
            contextId = input.contextId;
        } else if (input.locationContext) {
            const existingContext = await prisma.context.findFirst({
                where: {
                    type: "PLACE",
                    latitude: input.locationContext.latitude,
                    longitude: input.locationContext.longitude,
                },
                select: { id: true },
            });

            const context = existingContext || await prisma.context.create({
                data: {
                    type: 'PLACE',
                    name: input.locationContext.name,
                    address: input.locationContext.address,
                    latitude: input.locationContext.latitude,
                    longitude: input.locationContext.longitude,
                    updatedAt: new Date()
                }
            });
            contextId = context.id;
        }

        if (!contextId) {
            throw new Error("A context is required to create an article.");
        }

        // Create article
        const article = await prisma.article.create({
            data: {
                slug: uniqueSlug,
                title: input.title,
                content: input.content,
                type: input.type || 'POST',
                status: input.status || 'PUBLISHED',
                authorId: input.authorId,
                contextId: contextId,
                taxonomies: { create: [{ taxonomyId: input.categoryId }] },
                updatedAt: new Date()
            }
        });

        return article;
    }
}
