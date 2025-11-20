import { Router } from 'express';
import { PlaceController } from './modules/places/place.controller';
import { ArticleController } from './modules/articles/article.controller';
import { SeriesController } from './modules/series/series.controller';
import { GamificationController } from './modules/gamification/gamification.controller';
import { SearchController } from './modules/search/search.controller';
import { authenticate } from './middleware/auth';

const router = Router();
const placeController = new PlaceController();
const articleController = new ArticleController();
const seriesController = new SeriesController();
const gamificationController = new GamificationController();
const searchController = new SearchController();

// Places routes
router.post('/places', authenticate, placeController.create.bind(placeController));
router.get('/places', placeController.getPlaces.bind(placeController));

// Article routes
router.post('/articles', authenticate, articleController.create.bind(articleController));
router.put('/articles/:id', authenticate, articleController.update.bind(articleController));
router.get('/articles/:slug', articleController.getBySlug.bind(articleController));

// Series routes
router.post('/series', authenticate, seriesController.create.bind(seriesController));
router.post('/series/:id/articles', authenticate, seriesController.addArticle.bind(seriesController));
router.get('/series/:id', seriesController.getOne.bind(seriesController));

// Gamification routes
router.get('/badges', gamificationController.getBadges.bind(gamificationController));
router.get('/users/:userId/badges', gamificationController.getUserBadges.bind(gamificationController));

// Search routes
router.get('/search', searchController.search.bind(searchController));

export default router;
