import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getMessages, getUsersForSideBar, sendMessage } from "../controllers/messageControllers.js";

const messageRoutes = express.Router();

messageRoutes.get('/conversations', protectRoute, getUsersForSideBar);
messageRoutes.get('/:id', protectRoute, getMessages);
messageRoutes.post('/send/:id', protectRoute, sendMessage);


export default messageRoutes;