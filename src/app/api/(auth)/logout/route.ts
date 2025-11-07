import prisma from '../../../../../prisma';
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";

/**
 *  @method  GET
 *  @route   ~/api/users/logout
 *  @desc    Logout User
 *  @access  public
 */

export async function GET(request:NextRequest) {
    try {
        const token = request.cookies.get('jwtToken')?.value
        if(!token){
            return NextResponse.json({message:'no token provider'},{status:400})
        }

        const payload=verifyToken(token)
        if (!payload?.email) {
            return NextResponse.json({message:'Invalid Token'},{status:401})
        }

        await prisma.user.update(
            {
                where:{email:payload.email},
                data:{token:null}
            })
        const response= NextResponse.json({message:'Logout Done'},{status:201})

        response.cookies.set('jwtToken','',{
            httpOnly:true,
            secure:true,
            path:'/',
            expires:new Date(0)
        })

        return response
    } catch (error) {
        console.log('error during logout: ',error)
        return NextResponse.json({message:'internet server error'} , {status:500})
    }
}