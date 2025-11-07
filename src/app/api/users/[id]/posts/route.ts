import { authenticationAndAuthorization } from "@/middleware/authenticationAndAuthorization";
import { verifyToken } from "@/utils/verifyToken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../prisma";

interface UserProps{
    params:{id:string}
}

/**
 *  @method  GET
 *  @route   ~/api/users/[id]/posts
 *  @desc    Fetch posts of a specific user 
 *  @access  Public (Accessible by anyone)
 */

export async function GET(request:NextRequest,context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const token = (await cookies()).get('jwtToken')?.value 
        if (!token) {
            return NextResponse.json({ message: 'Token is missing' }, { status: 403 }) 
        }

        const userToken = verifyToken(token) 
        if (!userToken) {
            return NextResponse.json(
                { message: 'Invalid or expired token' },
                { status: 403 }
            ) 
        }

        const userId=parseInt(id)
        if(!userId){
            return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
        }


        const userPosts= await prisma.post.findMany({
            where:{userId},
            select:{
                id:true,
                caption:true,
                imageUrl:true,
                createdAt:true
            }
        })
        if (userPosts.length==0){
            return NextResponse.json(
                { message: "No posts found for this user" },
                { status: 404 })
        }
        return NextResponse.json({ data: userPosts }, { status: 200 })

    } catch (error) {
        const errorMessage =error instanceof Error ? error.message : 'An unexpected error occurred'
        return NextResponse.json({ error: errorMessage }, { status: 500 }) 
    }

    
}