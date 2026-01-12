import { UserRole } from './../../middleware/auth';
import { CommentStatus } from './../../../generated/prisma/enums';
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
        orderBy: {[sortBy]: sortOrder},  // {[sortBy]: sortOrder} [ ] this makes it dynamic to get the value of sortBy = req.query.sortBy.

        include: {
            _count: {
                select: {comments: true}
            }
        }
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
        },
        include: { 
            comments: {
                where: {
                    parentId: null,
                    status: CommentStatus.APPROVED
                },
                orderBy: {createdAt: "desc"},
                include: {
                    replies: {
                        where: {
                            status: CommentStatus.APPROVED
                        },
                        orderBy: {createdAt: "asc"},
                        include: {
                            replies: { 
                                include: {
                                    replies: {
                                        where: {
                                            status: CommentStatus.APPROVED
                                        },
                                        orderBy: {createdAt: "asc"},
                                    }
                                }
                            }
                        }
                    }
                }
            },
        _count: {
            select: {comments: true}
        }
        }
     })
     return postData;
    })

    return result;
}

const getMyPost = async (authorId: string) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            id: authorId,
            profile : "active"
        },
        select: {
            id: true
        }
    })

    const result = await prisma.post.findMany({
        where: {
            authorId
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            _count: {
                select : {
                    comments: true
                }
            }
        }
    })

    const total = await prisma.post.aggregate({
        _count: {
            id: true
        },
        where: {
            authorId
        }
    })
    return {
        data: result,
        total
    };
}


/** 
 * user - only can update their own post but can't update isFeatured
 * admin - can update everyone's post
 * **/

const updatePost = async (postId: string, data: Partial <Post>, authorId: string, isAdmin: boolean) => {
    // console.log({postId, data, authorId});

    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }
    })

    if(!isAdmin && (postData.authorId !== authorId)){
        throw new Error("you are not the creator of the post")
    }

    if(!isAdmin){
        delete data.isFeatured;
    }

    const result = await prisma.post.update({
        where: {
            id: postData.id
        },
        data
    })

    return result;

}

const deletePost = async (postId: string, authorId:string, isAdmin: boolean ) => {

    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }
    })

    if(!isAdmin && (postData.authorId !== authorId)){
        throw new Error("you are not the creator of the post")
    }

    return await prisma.post.delete({
        where: {
            id: postId
        }
    })
}

const getStats = async () => {
    return await prisma.$transaction(async (tx) => {
        const [totalPosts,publishedPosts,draftPosts,archivedPosts, totalComment, approvedComment, totalUser, adminCount, userCount, totalViews, avgView] = 
            await Promise.all([
                await tx.post.count(),
                await tx.post.count({where:{status: postStatus.PUBLISHED}}),
                await tx.post.count({where:{status: postStatus.DRAFT}}),
                await tx.post.count({where:{status: postStatus.ARCHIVED}}),
                await tx.comment.count(),
                await tx.comment.count({where: {status: CommentStatus.APPROVED}}),
                await tx.user.count(),
                await tx.user.count({where: {role: UserRole.ADMIN}}),
                await tx.user.count({where: {role: UserRole.USER}}),
                await tx.post.aggregate({
                    _sum: {views: true}
                }),
                await tx.post.aggregate({
                    _avg: {views: true}
                })
                

            ])

        return {
            totalPosts,
            publishedPosts,
            draftPosts,
            archivedPosts,
            totalComment,
            approvedComment,
            totalUser, 
            adminCount, 
            userCount,
            totalViews: totalViews._sum.views,
            avgView: avgView._avg.views
        }
    })
}

export const postService = {
    createPost,
    getAllPost,
    getPostById,
    getMyPost,
    updatePost,
    deletePost,
    getStats
}