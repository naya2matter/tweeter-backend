import prisma from '../../../../../prisma';
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs'
import { generateJWT } from "@/utils/generateJWT";
import { serialize } from "cookie";

/**
 *  @method  POST
 *  @route   ~/api/users/login
 *  @desc    LogIn
 *  @access  public
 */

export async function POST(request:NextRequest) {
    try {
        const {email,password}=await request.json()
        if(!email || !password){
            return NextResponse.json({message:'name , email and password is requierd'},{status:422})
        }

        const existingUser=await prisma.user.findFirst({where:{email}})
        if (!existingUser) {
            return NextResponse.json({message:'email not exist please go to register'},{status:404})
        }

        
        // Verify the password
        const isPasswordCorrect = await bcrypt.compare(password,existingUser.password)
        if (!isPasswordCorrect) {
            return NextResponse.json({message:'invalid password'},{status:403})
        }
        
        // Generate a new JWT token
        const jwtPayload={
            id:existingUser?.id,
            name:existingUser?.name,
            email:existingUser?.email,
            role:existingUser?.role
        }


        const newToken=generateJWT(jwtPayload)
        
        // Update the token in the database
        await prisma.user.update(
            {where:{email:email},
            data:{token:newToken}}
        )
        
        const isproduction=false
        const cookie=serialize('jwtToken', newToken,{
                    httpOnly:true,
                    secure:isproduction,
                    sameSite:'strict',
                    path:'/',
                    maxAge:60*60*24*30
                })

        let userData={
            id:existingUser?.id,
            name:existingUser?.name,
            email:existingUser?.email,
            role:existingUser?.role
        }


        return NextResponse.json({message:'login sucessfully',...userData,token:newToken} , {status:200,headers:{'Set-Cookie':cookie}})
    } catch (error) {
                return NextResponse.json({error: (error as Error).message},{status:500})        
    }
    
}