import { JWTPayload } from "@/utils/type";
import { verifyToken } from "@/utils/verifyToken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function authenticationAndAuthorization(request:NextRequest,allowedRoles:string[]):Promise<JWTPayload|null> {
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

        console.log('Decoded Payload:', userPayload)

        // التاكد اذا كانت صلاحية المستخدم (ROLE) من الصلاحيات المسموح لها بتنفيذ الامر
        if (!allowedRoles.includes(userPayload.role)) {
            console.error('Forbidden: User role is not authorized', {
            userRole: userPayload.role,
            allowedRoles,
        })
        return null
        }
        return userPayload

    } catch (error) {
        console.error('Error in authenticateAndAuthorize middleware:', error)
        return null 
    }
    
}