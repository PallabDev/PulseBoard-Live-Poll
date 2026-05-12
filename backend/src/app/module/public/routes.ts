import { Router } from 'express';
import { getPublicAnalytics, getPublicPoll } from './controller.js';

const router = Router();

router.get('/polls/:shareCode', getPublicPoll);
router.get('/analytics/:analyticsCode', getPublicAnalytics);

export default router;
