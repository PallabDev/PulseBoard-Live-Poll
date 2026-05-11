
import { Router } from 'express';
import { signin, signup, userinfo, signout } from './controller.js';
import verifyUser from './middleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/signout', verifyUser, signout);
router.get('/me', verifyUser, userinfo);

/*
    remaining stuff
    1. verify email token
    2. verify password reset token
    3. reset password
*/

export default router;
