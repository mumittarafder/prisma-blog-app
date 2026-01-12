import express from "express";
import { postRouter } from "./modules/post/post.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors"
import { commentRouter } from "./modules/post/comment/comment.route";

const app = express();
app.use(express.json());

app.use(cors({
    origin: process.env.APP_ORIGIN || "http://localhost:4000", // client site url 
    credentials: true
}))

app.all("/api/auth/{*any}", toNodeHandler(auth)); // splat

//// // Send all requests starting with /api/auth/ (GET, POST, etc.) to the auth system to handle login, signup, and related actions


app.get("/", (req, res) => {
    res.send("Hello Prisma with Express!");
})

app.use("/posts", postRouter);
app.use("/comments", commentRouter);

export default app;