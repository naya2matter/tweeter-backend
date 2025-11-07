import { authenticationAndAuthorization } from "@/middleware/authenticationAndAuthorization";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma";


/**
 *  @method  GET
 *  @route   ~/api/posts/feed
 *  @desc    Fetch all posts from users followed by the current user
 *  @access  Public (Accessible by anyone)
 */

export async function GET(request : NextRequest) {
    try {
        // التاكد اذا كان المستخدم له  token  والتاكد من صلاحيانه
        const userPayload= await authenticationAndAuthorization(request,['ADMIN','VIEWER','EDITOR'])
        if (!userPayload) {
            return NextResponse.json({error:'Forbidden'},{status:403})
        }

        //  جلب الأشخاص يلي بيتابعهم المستخدم الحالي
        const currUserId=userPayload.id
        const following=await prisma.follow.findMany({
            where:{followerId:currUserId},
            select:{followingId:true}
        })

        const followingIds=following.map(following=>(following.followingId))
        // إذا ما عم يتابع حدا رجع مصفوفة فاضية
        if (followingIds.length==0) {
            return NextResponse.json({ posts: [] }, { status: 200 });            
        }
        // جلب منشورات الاشخاض الي عم يتابعن
        const feedPosts=await prisma.post.findMany({
            where:{userId:{in: followingIds}},
            orderBy:{createdAt:'desc'},
            include:{user:{select:{name:true,id:true}}}
        })

        return NextResponse.json({ posts: feedPosts }, { status: 200 });


    } catch (error) {
        console.error("Error fetching feed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}