import { Request, Response } from 'express';
import { GamificationService } from './gamification.service';

const gamificationService = new GamificationService();

export class GamificationController {
    async getBadges(req: Request, res: Response) {
        try {
            const badges = await gamificationService.getAllBadges();
            res.json(badges);
        } catch (error) {
            console.error('Get badges error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getUserBadges(req: Request, res: Response) {
        try {
            const userId = Number(req.params.userId);
            const badges = await gamificationService.getUserBadges(userId);
            res.json(badges);
        } catch (error) {
            console.error('Get user badges error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
