import { CommentStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../../lib/prisma";

const createComment = async (payload: {
    content: string;
    authorId: string;
    postId: string;
    parentId?: string;
}) => {

    // If no record is found, findUniqueOrThrow throws an exception and execution stops.
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    })

    // If parentId is provided but does not exist, Prisma throws and execution stops.
    if(payload.parentId){
        await prisma.comment.findUniqueOrThrow({
            where: {
                id: payload.parentId
            }
        })
    }

    // the post exists, and either parentId is not provided or it exists.

    return await prisma.comment.create({
        data: payload
    })
}

const getCommentById = async (id: string) => {
    // console.log("comment id", commentId);

    

    return await prisma.comment.findUnique({
        where: {
            id
        },
        include: {
            post: {
                select:{
                    id: true,
                    title: true,
                    authorId: true,
                    views: true

                }

            }
        }
    })
}

const getByAuthorId = async (authorId: string) => {
    console.log("get by authorId", {authorId});

    return await prisma.comment.findMany({
        where: {
            authorId
        }
    })
}

const deleteComment = async (commentId: string, authorId: string) => {
    console.log({commentId, authorId});

    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select: {
            id: true,
            content: true

        }
        
    })
    console.log(commentData);

    if(!commentData){
        throw new Error("comment doesn't exists under this author Id or comment Id")
    }

    return await prisma.comment.delete({
        where: {
            id: commentId
            // id: commentData.id
        }
    })
}

// authorId, commendId, update data
const updateComment = async (commentId: string, data:{content?: string, status?: CommentStatus}, authorId: string) => {
    console.log({commentId, data, authorId});

    const updateCommentData = await prisma.comment.findFirst({
        where:{
            id: commentId,
            authorId
        }
    })

    if(!updateCommentData){
        throw new Error("update failed")
    }

    return await prisma.comment.update({
        where:{
            id: commentId,
            authorId
        },
        data
    })
}

const moderateComment = async (id: string, data:{status: CommentStatus}) => {
    // console.log("Moderate comment:", {id, data});

    const commentData = await prisma.comment.findUniqueOrThrow({
        where: {
            id
        },
        select: {
            id: true,
            status: true
        }
    })

    if(commentData.status === data.status){
        throw new Error(`your privided status ${data.status} is already up to date`);
    }

    return await prisma.comment.update({
        where: {
            id
        },
        data
    })
}


export const commentService = {
    createComment,
    getCommentById,
    deleteComment,
    updateComment,
    getByAuthorId,
    moderateComment
}