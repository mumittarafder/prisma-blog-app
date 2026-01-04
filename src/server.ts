import { prisma } from "./lib/prisma";
import app from "./app";

const PORT = process.env.port;

async function main() {
    try{
        await prisma.$connect();
        console.log("Connected to database successfuly");

        app.listen(PORT, () => {
            console.log(`server is running on http://localhost:${PORT}`);
        })
    }catch(error){
        console.error("An error occurred:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();