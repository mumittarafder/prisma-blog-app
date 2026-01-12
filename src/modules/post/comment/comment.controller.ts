import { Request, Response } from "express"
import { commentService } from "./comment.service"

const createComment = async (req: Request, res: Response) => {
    try {

        const user = req.user;
        req.body.authorId = user?.id;  // set user id from betterauth into postman dynamacilly

        const result = await commentService.createComment(req.body);
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({
            error: "comment creation failed",
            details: error
        })
    }
}

const getCommentById = async (req: Request, res: Response) => {
    try {

        const { commentId } = req.params;
        // console.log("req.params:", req.params);
        // console.log("commentId:", commentId);


        // console.log("this is from req.params",req.params);
        const result = await commentService.getCommentById(commentId as string);
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({
            error: "comment fetched failed",
            details: error
        })
    }
}

const getByAuthorId = async (req: Request, res: Response) => {
     try {
        const {authorId} = req.params;

        // console.log("this is from req.params",req.params);
        const result = await commentService.getByAuthorId(authorId as string);
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({
            error: "comment fetched failed",
            details: error
        })
    }
}

const deleteComment = async (req: Request, res: Response) => {
    try {

        const user = req.user;
        const { commentId } = req.params;

        const result = await commentService.deleteComment(commentId as string, user?.id as string);
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({
            error: "comment delete failed",
            details: error
        })
    }
}

const updateComment = async (req: Request, res: Response) => {
    try {

        const user = req.user;
        const { commentId } = req.params;

        const result = await commentService.updateComment(commentId as string, req.body, user?.id as string);
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ 
            error: "comment update failed",
            details: error
        })
    }
}
const moderateComment = async (req: Request, res: Response) => {
    try {

        const { commentId } = req.params;

        const result = await commentService.moderateComment(commentId as string, req.body);
        res.status(200).json(result)
    } catch (e) {
        const errorMessage = (e instanceof Error) ? e.message : "moderator comment update failed";
        res.status(400).json({ 
            error: errorMessage,
            details: e
        })
    }
}



export const commentController = {
    createComment,
    getCommentById,
    deleteComment,
    updateComment,
    getByAuthorId,
    moderateComment
}

// a4b71d2c-812f-407f-b583-639f840fa48f