import prisma from '../../../../../prisma';
import { generateJWT } from "@/utils/generateJWT";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs'
import { serialize } from 'cookie';

/**
 *  @method  POST
 *  @route   ~/api/users/signup
 *  @desc    Register
 *  @access  public
 */ 

export async function POST(request:NextRequest) {
    try {
        const {name,email,password}= await request.json()
        if (!name || !email || !password ) {
            return NextResponse.json({message:'name , email and password is requierd'},{status:422})
        }

        // Check if user already exists
        const existingUser=await prisma.user.findFirst({where:{email}})
        if (existingUser) {
            return NextResponse.json({message:'email already exist in db ,please login'},{status:403})
        }
        // generate token 
        const tokenPayload = { id: 0, name, email, role: 'VIEWER' } // Ensure id is part of tokenPayload
        const token = generateJWT(tokenPayload)

        //crypt password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        //create user
        const user = await prisma.user.create(
            {
                data:{
                    name , email , password:hashedPassword ,token
                }
            }
        )

        const isProduction = false;

        const cookie=serialize('jwtToken', token,{
            httpOnly:true,
            secure:isProduction,
            sameSite:'strict',
            path:'/',
            maxAge:60*60*24*30
        })
        
        if(!user){
            return NextResponse.json({message:'user not found'},{status:404})
        }
        return NextResponse.json({...user,message:'Registered And Authentication Done',token},
                                {status:201,headers:{'Set-Cookie':cookie}})
    } 
    
    catch (error) {
        if (error instanceof Error) {
                return NextResponse.json({ error: error.message }, { status: 500 })
            } else {
            return NextResponse.json(
                { error: 'Unexpected error occurred' },
                { status: 500 }
            )
            }
    }
}

