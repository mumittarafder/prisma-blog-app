import { Request, Response } from "express";
import { postService } from "./post.service";
import { postStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

const createPost = async (req: Request, res: Response) => {

    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "unauthorized",
            });
        }
        const result = await postService.createPost(req.body, user.id as string)
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({
            error: "post creation failed",
            details: error
        });

    }
};

const getAllPost = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;

        const searchString = typeof search === 'string' ? search : undefined;

        const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
        // console.log("search value",search);

        const isFeatured = req.query.isFeatured
            ? req.query.isFeatured === 'true' ? true
                : req.query.isFeatured === 'false' ? false : undefined
            : undefined;

        // console.log({ isFeatured });

        const status = req.query.status as postStatus | undefined;

        const authorId = req.query.authorId as string | undefined;

        // const page = Number(req.query.page ?? 1);
        // const limit = Number(req.query.limit ?? 10);
        // const skip = (page - 1) * limit;

        // const sortBy = req.query.sortBy as string | undefined;
        // const sortOrder = req.query.sortOrder as string | undefined;

        const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(req.query);

        // console.log({ page, limit, skip, sortBy, sortOrder });
        const result = await postService.getAllPost({ search: searchString, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder })


        res.status(200).json(result)
    } catch (error: any) {
        res.status(400).json({
            error: "post creation failed",
            details: error
        });
    }
};

const getPostById = async (req: Request, res: Response) => {
    try {

        const {postId} = req.params;

        if(!postId){
            throw new Error("post id is required")
        }
        
        const result = await postService.getPostById(postId)
        res.status(200).json(result)
    } catch (error: any) {
        res.status(400).json({
            error: "post creation failed",
            details: error
        });
    }
}

export const postController = {
    createPost,
    getAllPost,
    getPostById
}