import express from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.get(
    "/",
    postController.getAllPost 
)

router.get(
    "/my-post",auth(UserRole.ADMIN, UserRole.USER),
    postController.getMyPost 
)

router.get(
    "/stats",
    postController.getStats
)
// if move /:postId top you will get classic Express routing shadowing bug or error.
router.get(
    "/:postId",  
    postController.getPostById
)



// /:postId ---> it's a route parameter... http://localhost:5001/posts/123 -->
    //  req.params.postId = 123 or postId = 123

router.post("/", auth(UserRole.USER, UserRole.ADMIN), postController.createPost);
// here sending ["USER"] or UserRole.USER as argument 

router.patch("/:postId", auth(UserRole.ADMIN, UserRole.USER), postController.updatePost)

router.delete("/:postId", auth(UserRole.ADMIN, UserRole.USER), postController.deletePost)

export const postRouter = router;