import express from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.get(
    "/",
    postController.getAllPost 
)

router.get(
    "/:postId",  
    postController.getPostById
)
// /:postId ---> it's a route parameter... http://localhost:5001/posts/123 -->
    //  req.params.postId = 123 or postId = 123

router.post("/", auth(UserRole.USER), postController.createPost);
// here sending ["USER"] or UserRole.USER as argument 


export const postRouter = router;