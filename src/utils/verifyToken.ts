import jwt,{ JwtPayload } from "jsonwebtoken"

export function verifyToken(token:string|null):JwtPayload|null {
    try {
        if(!token){
            return null
        }
        const privateKey="191d34a878fc733e57dece01c976351d"
        const userPayload=jwt.verify(token,privateKey) as JwtPayload
        return userPayload
        
    } catch (error) {
        return null
    }
    
}