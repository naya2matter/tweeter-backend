import { JWTPayload } from "@/utils/type"
import { verifyToken } from "@/utils/verifyToken"
import { cookies } from "next/headers"
import prisma from "../../prisma"
import { NextResponse } from "next/server"
// التحقق من أن المستخدم هو صاحب المنشور
export async function authPostOwnerShip(postId:number):Promise<JWTPayload|null>  {
    try {
        //جلب ال  token  من ال  cookies
        const token = (await cookies()).get("jwtToken")?.value
        // التاكد من وجود token 
        if (!token) {
            console.error('No JWT token found in cookies')
            return null
        }

        // التاكد من صحة ال  token
        const userPayload=verifyToken(token)as JWTPayload
        if (!userPayload) {
            console.error('Invalid or expired token')
            return null }
        // جلب المنشور والتحقق من وجوده ومن ان المستخدم هو صاحب المنشور
        const post=await prisma.post.findUnique({where:{id:postId}})
        if (!post) {
            console.log('post not found')
            return null
        }
        if (post.userId !=userPayload.id) {
            console.error("Forbidden: Not your post");
            return null
        }

        return userPayload
    } catch (error) {
        console.error('Error in authPostOwnerShip middleware:', error)
        return null     }
    
}