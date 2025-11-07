import { authenticationAndAuthorization } from "@/middleware/authenticationAndAuthorization";
import { authPostOwnerShip } from "@/middleware/authPostOwnerShip";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import prisma from "../../../../../prisma";
interface Props{
    params:{id:string}
}

/**
 * @method PUT
 * @route /api/posts/[id]
 * @desc Update post (caption or image)
 * @access Owner only
 */
export async function PUT(request:NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const userPayload=await authPostOwnerShip(parseInt(id))
        if (!userPayload) {
            return NextResponse.json({error:'Forbidden'},{status:403})
        }

        // Check if the content type of the request is multipart/form-data (for file uploads)
        const contentType = request.headers.get('content-type') || ''
        if (!contentType.includes('multipart/form-data')) {
        return NextResponse.json(
            { error: 'Invalid content type' },
            { status: 400 }
        ) // Return a 400 Bad Request if content type is not multipart/form-data
        }

        // Parse form data from the request
        const formData = await request.formData()
        const newPost = formData.get('newPost')?.toString() // Extract new tweet text
        const imageFile = formData.get('imageFile') as File // Extract the image file from form data

        // Validation: Ensure at least one of the fields is provided
        if (!newPost && !imageFile) {
        return NextResponse.json({ error: 'Invalid Data' }, { status: 422 }) // Return 422 Unprocessable Entity if no data is provided
        }

        // Define allowed image types and max file size
        const allowedTypes = ['image/jpeg', 'image/png'] // Allowed image file types
        const maxFileSize = 2 * 1024 * 1024 // Max file size of 2MB

        if (imageFile) {
        // Check if the image file type is allowed
        if (!allowedTypes.includes(imageFile.type)) {
            return NextResponse.json(
            {
                error: `Invalid file type. Allowed types: ${allowedTypes.join(
                ', '
                )}`,
            },
            { status: 400 }
            ) // Return 400 for invalid file type
        }

        // Check if the file size exceeds the limit
        if (imageFile.size > maxFileSize) {
            return NextResponse.json(
            {
                error: `File size exceeds the limit of ${
                maxFileSize / 1024 / 1024
                }MB`,
            },
            { status: 400 }
            ) // Return 400 for file size exceeding the limit
        }

        // Directory where the uploaded images will be stored
        const uploadDir = path.join(process.cwd(), '/public/uploads')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true }) // Create directory if it doesn't exist
        }

        // Save the image file to the server
        const fileName = `${Date.now()}_${imageFile.name.trim()}`
        const filePath = path.join(uploadDir, fileName)
        const buffer = Buffer.from(await imageFile.arrayBuffer()) // Convert image file to buffer
        fs.writeFileSync(filePath, new Uint8Array(buffer)) // Save the image to the filesystem

        // Update the post's image URL in the database
        await prisma.post.update({
            data: { imageUrl: `/uploads/${fileName}` }, // Set the new image URL
            where: { id: parseInt(id) }, // Find the post by ID
        })
        }

        // Update the 
        // post's content if newpost is provided
        if (newPost) {
        await prisma.post.update({
            data: { caption: newPost }, // Update the caption content
            where: { id: parseInt(id) }, // Find the post by ID
        })
        }

        // Fetch the updated post
        const updatedPost = await prisma.post.findFirst({
        where: { id: parseInt(id) }, // Find the post by ID
        })

        // Return the updated post with 200 OK status
        return NextResponse.json({ post: updatedPost }, { status: 200 })
    } catch (error) {
        // Handle unexpected errors
        if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 }) // Return specific error message
        } else {
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        ) // Return generic error message for unknown errors
        }
    }
    }


    /**
 * @method DELETE
 * @route /api/posts/[id]
 * @desc delete post 
 * @access Owner only
 */

export async function DELETE(request:NextRequest,context: { params: Promise<{ id: string }>} ) {
    try {
        const { id } = await context.params;
        const userPayload=await authPostOwnerShip(parseInt(id))
        if (!userPayload) {
            return NextResponse.json({error:'Forbidden'},{status:403})
        }
        //  التحقق من وجود المنشور
        const post = await prisma.post.findUnique({ where: { id: parseInt(id)  } })
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 })
        }
        // حذف الصورة من ملف ال  uploade  اذا كانت موجودة
        if (post.imageUrl) {
            const imagePath = path.join(process.cwd(), "public", post.imageUrl)
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath)
            }
        }

        // حذف ال  post  من ال  db 

        const deletedPost = await prisma.post.delete({
            where: { id: parseInt(id) }, // Find and delete the tweet by ID
        })
        
        return NextResponse.json({ deletedPost }, { status: 200 })
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 }) // Return specific error message
        } else {
            return NextResponse.json(
                { error: 'An unexpected error occurred' },
                { status: 500 } // Return generic error message for unknown errors
            )
        }
        
    }
    
}

// import { NextRequest, NextResponse } from "next/server";
// import { authPostOwnerShip } from "@/middleware/authPostOwnerShip";
// import prisma from "../../../../../prisma";
// import path from "path";
// import fs from "fs";

// // 🧩 لاحظي هون: params Promise لأن Next.js 15 صار async
// export async function PUT(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     // ✅ لازم نعمل await هون
//     const { id } = await context.params;
//     const postId = parseInt(id);

//     console.log("➡️ PUT Request for Post ID:", postId);

//     const userPayload = await authPostOwnerShip(postId);
//     if (!userPayload) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const contentType = request.headers.get("content-type") || "";
//     if (!contentType.includes("multipart/form-data")) {
//       return NextResponse.json(
//         { error: "Invalid content type" },
//         { status: 400 }
//       );
//     }

//     const formData = await request.formData();
//     const newPost = formData.get("newPost")?.toString();
//     const imageFile = formData.get("imageFile") as File | null;

//     if (!newPost && !imageFile) {
//       return NextResponse.json(
//         { error: "Invalid data, nothing to update" },
//         { status: 422 }
//       );
//     }

//     const allowedTypes = ["image/jpeg", "image/png"];
//     const maxFileSize = 2 * 1024 * 1024; // 2MB

//     let imageUrl: string | undefined;

//     if (imageFile) {
//       if (!allowedTypes.includes(imageFile.type)) {
//         return NextResponse.json(
//           { error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}` },
//           { status: 400 }
//         );
//       }

//       if (imageFile.size > maxFileSize) {
//         return NextResponse.json(
//           { error: "File too large (max 2MB)" },
//           { status: 400 }
//         );
//       }

//       const uploadDir = path.join(process.cwd(), "public/uploads");
//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }

//       const fileName = `${Date.now()}_${imageFile.name}`;
//       const filePath = path.join(uploadDir, fileName);
//       const buffer = Buffer.from(await imageFile.arrayBuffer());
//       fs.writeFileSync(filePath, new Uint8Array(buffer));

//       imageUrl = `/uploads/${fileName}`;
//     }

//     const updatedPost = await prisma.post.update({
//       where: { id: postId },
//       data: {
//         ...(newPost ? { caption: newPost } : {}),
//         ...(imageUrl ? { imageUrl } : {}),
//       },
//     });

//     return NextResponse.json({ post: updatedPost }, { status: 200 });
//   } catch (error) {
//     console.error("❌ Error in PUT /api/posts/[id]:", error);
//     return NextResponse.json(
//       {
//         error:
//           error instanceof Error
//             ? error.message
//             : "An unexpected error occurred",
//       },
//       { status: 500 }
//     );
//   }
// }

// // 🧩 DELETE endpoint
// export async function DELETE(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await context.params;
//     const postId = parseInt(id);

//     console.log("➡️ DELETE Request for Post ID:", postId);

//     const userPayload = await authPostOwnerShip(postId);
//     if (!userPayload) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const post = await prisma.post.findUnique({ where: { id: postId } });
//     if (!post) {
//       return NextResponse.json({ error: "Post not found" }, { status: 404 });
//     }

//     if (post.imageUrl) {
//       const imagePath = path.join(process.cwd(), "public", post.imageUrl);
//       if (fs.existsSync(imagePath)) {
//         fs.unlinkSync(imagePath);
//       }
//     }

//     const deletedPost = await prisma.post.delete({ where: { id: postId } });
//     return NextResponse.json({ deletedPost }, { status: 200 });
//   } catch (error) {
//     console.error("❌ Error in DELETE /api/posts/[id]:", error);
//     return NextResponse.json(
//       {
//         error:
//           error instanceof Error
//             ? error.message
//             : "An unexpected error occurred",
//       },
//       { status: 500 }
//     );
//   }
// }
