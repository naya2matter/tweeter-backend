import { authenticationAndAuthorization } from "@/middleware/authenticationAndAuthorization";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../prisma";
import { date } from "zod";

interface Props{
    params:{id:string}
}

/**
 * @method POST
 * @route /api/posts/[id]/follow
 * @desc Create a new follow
 * @access Public (Accessible by anyone)
 */

export async function POST(request:NextRequest,context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        // التاكد اذا المستخدم مسجل دخول

        const userPayload=await authenticationAndAuthorization(request,['ADMIN','EDITOR','VIEWER'])
        if (!userPayload) {
            return NextResponse.json({error:'Forbidden'},{status:403})
        }

        // الشخص الي بدنا نتابعو
        const followerId= parseInt(id)
        // الشخص الي رج تبعتلو طلب المتابعة
        const followingId=userPayload.id

        // ممنوع تتابع نفسك
        if (followerId==followingId) {
            return NextResponse.json({ message: "You cannot follow yourself" },{ status: 400 });
        }

        // التاكد اذا كان متابعو مسبقا
        const existingfollow=await prisma.follow.findFirst({where:{followerId,followingId}})
        if (existingfollow) {
            return NextResponse.json({ message: "You are already follow this user" },{ status: 400 });
        }
        // اضافة متابعة جديدة
        const newFollow=await prisma.follow.create({
            data:{followerId,followingId}
        })

        return NextResponse.json({message: "Follow successful",data:newFollow},{status:200})
    } catch (error) {
        // Handle unexpected errors
        if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 }) // Return specific error message
        } else {
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
        
    }}
    
}


export async function DELETE(request:NextRequest,context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const userPayload=await authenticationAndAuthorization(request,['ADMIN','EDITOR','VIEWER'])
        if (!userPayload) {
            return NextResponse.json({error:'Forbidden'},{status:403})
        }

        // الشخص الي بدنا نتابعو
        const followerId= parseInt(id)
        // الشخص الي رج تبعتلو طلب المتابعة
        const followingId=userPayload.id

        // التحقق من وجود متابعة اصلا
        const existingfollow=await prisma.follow.findFirst({where:{followerId,followingId}})
        if (!existingfollow) {
            return NextResponse.json({ message: "You haven't follow this user" },{ status: 400 });
        }

        // الغاء المتابعة
        const deleteFollow=await prisma.follow.deleteMany({where:{followerId,followingId}})

        return NextResponse.json({message: "deleted follow successful"},{status:200})
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
