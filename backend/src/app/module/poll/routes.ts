import { Router } from "express";
import verifyUser from "../auth/middleware.js";
import { createPoll, createQuestion, updateOption, updatePoll, updateQuestion, updateQuestionOrder } from "./controller.js";

const router = Router();

router.post("/", verifyUser, createPoll);
router.patch("/:pollId", verifyUser, updatePoll);

// router.get("/:pollId",) // poll information get here


router.post("/:pollId/question", verifyUser, createQuestion);
router.patch("/:pollId/question/:questionId", verifyUser, updateQuestion);
router.patch("/:pollId/questions/order", verifyUser, updateQuestionOrder);


router.patch("/:pollId/:questionId/:optionId", verifyUser, updateOption);

export default router;
