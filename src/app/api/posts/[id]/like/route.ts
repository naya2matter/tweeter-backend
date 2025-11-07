import { authenticationAndAuthorization } from "@/middleware/authenticationAndAuthorization";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../prisma";

interface Props{
    params:{id:string}
}

/**
 * @method POST
 * @route /api/posts/[id]/like
 * @desc Create a new reaction
 * @access Public (Accessible by anyone)
 */
export async function POST(request:NextRequest,context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const userPayload=await authenticationAndAuthorization(request,['ADMIN','EDITOR','VIEWER'])
        if (!userPayload) {
            return NextResponse.json({error:'Forbidden'},{status:403})
        }

        const userId=userPayload.id
        const postId=parseInt(id)

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        const existingLike=await prisma.reaction.findFirst({where:{userId,postId}})
        if (existingLike) {
            return NextResponse.json({ message: "You are already liked in this post" },{ status: 400 });
        }

        const newLike=await prisma.reaction.create({
            data:{userId,postId}
        })

        return NextResponse.json({message:'liked successfully', data:newLike},{status:200})
    } catch (error) {
        // Handle unexpected errors
        if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 }) // Return specific error message
        } else {
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
    }
    
}


/**
 * @method DELETE
 * @route /api/posts/[id]/like
 * @desc delete reaction
 * @access Owner only
 */

export async function DELETE(request:NextRequest,context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const userPayload=await authenticationAndAuthorization(request,['ADMIN','EDITOR','VIEWER'])
        if (!userPayload) {
            return NextResponse.json({error:'Forbidden'},{status:403})
        }

        const userId=userPayload.id
        const postId=parseInt(id)

        const existingLike=await prisma.reaction.findFirst({where:{userId,postId}})
        if (!existingLike) {
            return NextResponse.json({ message: "You haven't liked this post" },{ status: 400 });
        }

        const deleteLike= await prisma.reaction.delete({where:{id:existingLike.id}})

        return NextResponse.json({ message: "Like delete successfully" },{ status: 200 });
    } catch (error) {
        // Handle unexpected errors
        if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 }) // Return specific error message
        } else {
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
    }
    
}