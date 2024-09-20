import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoute.js";
import { app, server } from "./socket/socket.js";

dotenv.config();

const port = process.env.PORT || 5000;
const _dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

if (process.env.NODE_ENV !== 'development') {
    app.use(express.static(path.join(_dirname, "/client/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(_dirname, "client", "dist", "index.html"));
    });
}


server.listen(port, () => console.log(`server running on port: ${port}`))
