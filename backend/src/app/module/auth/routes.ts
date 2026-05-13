
import { Router } from 'express';
import { signin, signup, userinfo, signout, verifyEmail, forgotPassword, resetPassword, refreshTokenController } from './controller.js';
import verifyUser from './middleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/signout', verifyUser, signout);
router.get('/me', verifyUser, userinfo);

router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshTokenController);

export default router;
