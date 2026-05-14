import { Router } from 'express';
import { getParticipantSummary, getPublicAnalytics, getPublicPoll } from './controller.js';

const router = Router();

router.get('/polls/:shareCode', getPublicPoll);
router.get('/analytics/:analyticsCode', getPublicAnalytics);
router.get('/analytics/:analyticsCode/participants', getParticipantSummary);

export default router;
