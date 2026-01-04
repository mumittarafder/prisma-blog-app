import express from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.get(
    "/",
    postController.getAllPost 
)

router.post("/", auth(UserRole.USER), postController.createPost);
// here sending ["USER"] or UserRole.USER as argument 


export const postRouter = router;