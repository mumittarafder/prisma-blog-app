import express, { Request, Response, NextFunction, Router } from "express";
import {auth as betterAuth} from '../lib/auth'


export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}

declare global {
    namespace Express {
        interface Request{
            user?:{
                id: string,
                email: string,
                name: string,
                role: string,
                emailVerified: boolean;
            }
        }
    }
}

const auth = (...roles: UserRole[]) => {
    // recieving the role here 
    return async (req: Request, res: Response, next: NextFunction) => {
        // get user session
        try{
            const session = await betterAuth.api.getSession({
            headers: req.headers as any
        })

        if(!session){
            return res.status(401).json({
                success: false,
                message: "you are not authorized"
            })
        }
        if(!session.user.emailVerified){
            return res.status(403).json({
                success: false,
                message: "Email verification required. Please verify your email!"
            })
        }

        req.user = {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role as string,
            emailVerified: session.user.emailVerified
        }
        if(roles.length && !roles.includes(req.user.role as UserRole)){
            // When a request comes from the front-end (Postman/browser):
            //Front-end sends session info or token --> req.user.role
            //roles = guest list set by you (server)
            //req.user.role = person’s ID from their ticket (session)


            return res.status(403).json({
                success: false,
                message: "Forbidden! you dont have permission to access this resources"
            })
        }
        }catch(error:any){
            next(error)
        }

        next()
    }
}


export default auth;