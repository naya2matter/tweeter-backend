import { authenticationAndAuthorization } from "@/middleware/authenticationAndAuthorization";
import  fs  from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import prisma from "../../../../prisma";


export const config = {
    api: {
        bodyParser: false, 
    },
} 

/**
 *  @method  POST
 *  @route   ~/api/posts
 *  @desc    Create a new post with an optional image upload
 *  @access  Private (Only accessible by users with 'EDITOR' or 'ADMIN' roles)
 */

export async function POST(request:NextRequest) {
    try {
        const userPayload=authenticationAndAuthorization(request,['ADMIN' , 'EDITOR'])
        if (!userPayload) {
            return NextResponse.json({error:'Forbidden'},{status:403})
        }

        const uploadDir=path.join(process.cwd(),'/public/uplaods')
        const allowedTypes=['image/jpeg','image/png']
        const maxFileSize=2*1024*1024

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir,{recursive:true})
        }

        const formData= await request.formData()
        const imageFile = formData.get('image')as File
        const caption = formData.get('caption')?.toString()
        const userId = parseInt(formData.get('userId')?.toString() || '0')

        if (!imageFile || !caption || !userId) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 422 }) 
        }

        // Validate image file type
        if (!allowedTypes.includes(imageFile.type)) {
            return NextResponse.json(
                {
                error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, // Return 400 for unsupported file types
                },
                { status: 400 }
            )
        }

        // Validate image file size
        if (imageFile.size > maxFileSize) {
            return NextResponse.json(
                {
                error: `File size exceeds the limit of ${
                    maxFileSize / 1024 / 1024
                }MB`, // Return 400 if file size exceeds limit
                },
                { status: 400 }
            )
        }
        
        const fileName = `${Date.now()}_${imageFile.name}`
        const filePath = path.join(uploadDir, fileName)

        const buffer = Buffer.from(await imageFile.arrayBuffer())
        fs.writeFileSync(filePath, new Uint8Array(buffer)) // Save the file

        const createdPost = await prisma.post.create({
            data:{
                caption,
                imageUrl:`/uploads/${fileName}`,
                userId,

            }
        })
        return NextResponse.json({ post: createdPost }, { status: 201 })

    } catch (error) {
        const errorMessage =error instanceof Error ? error.message : 'An unexpected error occurred'
        return NextResponse.json({ error: errorMessage }, { status: 500 }) // Return 500 for unexpected errors
    }
    
}

/**
 *  @method  GET
 *  @route   ~/api/posts
 *  @desc    Fetch all posts
 *  @access  Public (Accessible by anyone)
 */

export async function GET(request:NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''

        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    {caption: {
                        contains: search,
                        },
                    },
                    {caption: {
                        contains: search.toLowerCase(),
                        },
                    },
                    {caption: {
                        contains: search.toUpperCase(),
                        },
                    },
                    ],
                },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                select: {
                    id: true,
                    name: true, 
                },
                },
            },
        })
        return NextResponse.json({ data: posts }, { status: 200 })

    } catch (error) {
        const errorMessage =error instanceof Error ? error.message : 'An unexpected error occurred'
        return NextResponse.json({ error: errorMessage }, { status: 500 }) 
    }
    
}

