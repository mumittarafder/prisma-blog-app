import { Verification } from './../../generated/prisma/client';
import { prisma } from "../lib/prisma";
import { UserRole } from "../middleware/auth";

async function seedAdmin() {
    try{
        console.log("***** admin seeding started");
        const adminData = {
            name: "Mr. Admin2",
            email: "admin2@gmail.com",
            role: UserRole.ADMIN,
            password: "admin12345"
        }
        console.log("checks admin exists or not");
        // check if user exists on db or not
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        });

        if(existingUser){
            throw new Error("user already exists!!!")
        };

        const signUpAdmin = await fetch('http://localhost:5001/api/auth/sign-up/email', {
            method: 'POST',
            headers: {
                "content-type": "application/json",
                "origin": "http://localhost:4000"
                // have to match with trusted origin app url
            },
            body: JSON.stringify(adminData)
        })

        console.log("**** admin created");
        if(signUpAdmin.ok){
            await prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true
                }
            })
            console.log("email Verification status updated");
        }

        console.log("***** succes ******");

    }catch(error){
        console.log(error);
    }
}

seedAdmin();