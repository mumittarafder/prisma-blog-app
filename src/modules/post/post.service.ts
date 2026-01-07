import { SortOrder } from './../../../generated/prisma/internal/prismaNamespace';
import { Post, postStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";


const createPost = async (data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    })
    return result;
};

const getAllPost = async (
    { search,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      limit,
      skip,
      sortBy,
      sortOrder
    }
    : {
    search: string | undefined, 
    tags: string[] | [],
    isFeatured: boolean | undefined,
    status: postStatus | undefined,
    authorId: string | undefined,
    page: number,
    limit: number,
    skip: number,
    sortBy: string,
    sortOrder: string 
}) => {
    const andConditions:PostWhereInput[] = [];
    if (search) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: search as string,
                        mode: "insensitive"
                    }
                },
                {
                    content: {
                        contains: search as string,
                        mode: "insensitive"
                    }
                },
                {
                    tags: {
                        has: search as string
                    }
                },

            ]
        });
    };

    if (tags.length > 0) {
        andConditions.push({
            tags: {
                hasEvery: tags as string[]
            }
        })
    };

    if(typeof isFeatured === 'boolean'){
        andConditions.push({
            isFeatured
        })
    }

    if(status){
        andConditions.push({
            status
        })
    }

    if(authorId){
        andConditions.push({
            authorId
        })
    }

    const allPost = await prisma.post.findMany({
        take: limit,
        skip, 
        where: {
            AND: andConditions
        },
        orderBy: {[sortBy]: sortOrder}  // {[sortBy]: sortOrder} [ ] this makes it dynamic to get the value of sortBy = req.query.sortBy.
    });
    
    const total = await prisma.post.count({
        where: {
            AND: andConditions
        }
    })

    return {
        data: allPost,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total/limit)
        }
    };
}

// transaction rollback --> both has to work if one fail both of them gives error and rollback to prev value or current value
const getPostById = async (postId: string) => {
    const result = await prisma.$transaction(async (tx) => {
        await tx.post.update({
        where:{
            id: postId
        },
        data:{
            views: {
                increment: 1
            }
        }
     })
    
    const postData = await tx.post.findUnique({
        where:{
            id: postId
        }
     })
     return postData;
    })

    return result;
}

export const postService = {
    createPost,
    getAllPost,
    getPostById
}