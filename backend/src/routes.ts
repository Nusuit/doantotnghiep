import { Router } from 'express';
import { PlaceController } from './modules/places/place.controller';
import { authenticate } from './middleware/auth';

const router = Router();
const placeController = new PlaceController();

// Places routes
router.post('/places', authenticate, placeController.create.bind(placeController));
router.get('/places', placeController.getPlaces.bind(placeController));

export default router;
