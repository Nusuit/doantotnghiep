import { Request, Response } from 'express';
import { PlaceService } from './place.service';

const placeService = new PlaceService();

export class PlaceController {
    /**
     * POST /api/places
     * Create a new place (Protected route)
     */
    async create(req: Request, res: Response) {
        try {
            // Assuming user ID is attached to req.user by auth middleware
            // Adjust based on actual auth middleware implementation
            const authorId = (req as any).user?.id;

            if (!authorId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { name, description, address, latitude, longitude, category, coverImage } = req.body;

            if (!name || latitude === undefined || longitude === undefined) {
                return res.status(400).json({ message: 'Missing required fields: name, latitude, longitude' });
            }

            const place = await placeService.createPlace(Number(authorId), {
                name,
                description,
                address,
                latitude: Number(latitude),
                longitude: Number(longitude),
                category,
                coverImage,
            });

            res.status(201).json(place);
        } catch (error) {
            console.error('Error creating place:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * GET /api/places
     * Get places list (Public) - supports bounding box query
     */
    async getPlaces(req: Request, res: Response) {
        try {
            const { minLat, maxLat, minLng, maxLng } = req.query;

            if (minLat && maxLat && minLng && maxLng) {
                const places = await placeService.getPlacesInBounds(
                    Number(minLat),
                    Number(maxLat),
                    Number(minLng),
                    Number(maxLng)
                );
                return res.json(places);
            }

            // Fallback: return all places or implement pagination if needed
            // For now, returning empty list if no bounds provided to avoid dumping entire DB
            return res.json([]);
        } catch (error) {
            console.error('Error fetching places:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
