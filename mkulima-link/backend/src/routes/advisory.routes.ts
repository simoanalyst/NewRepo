import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as AdvisoryController from '../controllers/advisory.controller';

const router = Router();
router.get('/', AdvisoryController.listAdvisories);
router.get('/:id', AdvisoryController.getAdvisory);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), AdvisoryController.createAdvisory);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), AdvisoryController.updateAdvisory);

router.get('/knowledge/articles', AdvisoryController.listKnowledgeArticles);
router.get('/knowledge/articles/:id', AdvisoryController.getKnowledgeArticle);

export default router;
