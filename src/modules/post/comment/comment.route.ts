import express from "express";
import { commentController } from "./comment.controller";
import auth, { UserRole } from "../../../middleware/auth";

const router = express.Router();

router.get("/:commentId", commentController.getCommentById)

router.get("/author/:authorId", auth(UserRole.USER), commentController.getByAuthorId)

router.delete("/:commentId", auth(UserRole.ADMIN, UserRole.USER), commentController.deleteComment)

router.patch("/:commentId", auth(UserRole.ADMIN, UserRole.USER) , commentController.updateComment)

router.post("/", auth(UserRole.USER, UserRole.ADMIN), commentController.createComment)

router.patch("/:commentId/moderate", auth(UserRole.ADMIN), commentController.moderateComment)

export const commentRouter = router;