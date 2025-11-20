import { PrismaClient, Place } from '@prisma/client';

const prisma = new PrismaClient();

export class PlaceService {
  /**
   * Create a new place
   */
  async createPlace(authorId: number, data: {
    name: string;
    description?: string;
    address?: string;
    latitude: number;
    longitude: number;
    category?: string;
    coverImage?: string;
  }): Promise<Place> {
    return prisma.place.create({
      data: {
        ...data,
        authorId,
      },
    });
  }

  /**
   * Get places within a map viewport (bounding box)
   */
  async getPlacesInBounds(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
  ): Promise<Place[]> {
    return prisma.place.findMany({
      where: {
        latitude: {
          gte: minLat,
          lte: maxLat,
        },
        longitude: {
          gte: minLng,
          lte: maxLng,
        },
      },
    });
  }
}
