import jwt, { JwtPayload } from "jsonwebtoken"

export function generateJWT(jwtPayload:JwtPayload) {
    const privateKey="191d34a878fc733e57dece01c976351d"
    const token=jwt.sign(jwtPayload,privateKey,{expiresIn:'30d'})
    return token
}