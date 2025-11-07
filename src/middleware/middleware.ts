import { verifyToken } from "@/utils/verifyToken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../prisma";


//   middleware يعترض الطلبات المتجهة للـ Routes المحمية.

export async function middleware(request:NextRequest) {
    const protecteUrl = ["/api/posts" , "/api/follow" , "/api/reaction"]
    try {
        //لحفط المسارات المبعوتة بال request
        const {pathname}= await request.nextUrl
        //حفظ المسارات المحمية بمتغير
        const isProtected= protecteUrl.some((route)=>(pathname.startsWith(route)))
        //اذا الرابط مو من الروابط المحمية يعني متل ال login , register  فما في داعي يدخل بال  middleware  اصلا
        if (!isProtected) {
            return NextResponse.next()
        }

        // التاكد اذا كان ال  token  موجود ضمن ال db
        const token = (await cookies()).get("jwtToken")?.value as string
        if (!token) {
            return NextResponse.json({message:'no token provider'},{status:401})
        }

        // التاكد من صحة معلومات  
        const decodedtoken = verifyToken(token)
        if (!decodedtoken || !decodedtoken.email) {
            return NextResponse.json({message:'no token provider'},{status:401})
        }

        // العثور على المستخدم صاحب الايميل المستخرج من ال token  
        const user= await prisma.user.findUnique({
            where:{email:decodedtoken.email}
        })

        if (!user) {
            return NextResponse.json({message:'Unauthorized user'},{status:401})
        }

        return NextResponse.next()
    } catch (error) {
        console.error(" Middleware Error:", error)
        return NextResponse.json({ message: "Internal Server Error" },{ status: 500 })
    }
    
    
}
///
export const config = {
        matcher: ["/api/:path*"], // يشتغل على جميع الـ API routes
    };