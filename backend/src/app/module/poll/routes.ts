import { Router } from "express";
import verifyUser from "../auth/middleware.js";
import { createPoll, createQuestion, deletePoll, deleteQuestion, updateOption, updatePoll, updateQuestion, updateQuestionOrder, getAllPolls, getPollById } from "./controller.js";

const router = Router();

router.post("/", verifyUser, createPoll);
router.patch("/:pollId", verifyUser, updatePoll);
router.delete("/:pollId", verifyUser, deletePoll);

// GET routes
router.get("/mypoll", verifyUser, getAllPolls);
router.get("/mypoll/:pollId", verifyUser, getPollById);


router.post("/:pollId/question", verifyUser, createQuestion);
router.patch("/:pollId/question/:questionId", verifyUser, updateQuestion);
router.delete("/:pollId/question/:questionId", verifyUser, deleteQuestion);
router.patch("/:pollId/questions/order", verifyUser, updateQuestionOrder);


router.patch("/:pollId/:questionId/:optionId", verifyUser, updateOption);

export default router;
