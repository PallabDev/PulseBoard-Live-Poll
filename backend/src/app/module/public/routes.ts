import { Router } from 'express';
import { getParticipantSummary, getPublicAnalytics, getPublicPoll } from './controller.js';
import verifyUser, { optionalVerifyUser } from '../auth/middleware.js';

const router = Router();

router.get('/polls/:shareCode', optionalVerifyUser, getPublicPoll);
router.get('/analytics/:analyticsCode', verifyUser, getPublicAnalytics);
router.get('/analytics/:analyticsCode/participants', verifyUser, getParticipantSummary);

export default router;
