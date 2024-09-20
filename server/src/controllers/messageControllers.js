import prisma from "../db/prisma.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user.id;

        // check if there was a conversation between the two
        let conversation = await prisma.conversation.findFirst({
            where: {
                participantIds: {
                    hasEvery: [senderId, receiverId],
                }
            }
        });

        // create the conversation if it didn't exist
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    participantIds: {
                        set: [senderId, receiverId]
                    }
                }
            })
        };

        // create the new message inside that conversation
        const newMessage = await prisma.message.create({
            data: {
                senderId,
                body: message,
                conversationId: conversation.id
            }
        });

        // when new message is sent to an existing conversation add the message to the messages array of the conversation model
        if (newMessage) {
            conversation = await prisma.conversation.update({
                where: {
                    id: conversation.id
                },
                data: {
                    messages: {
                        connect: {
                            id: newMessage.id
                        },
                    },
                },
            });
        };

        // * Socket io will go here
        const receiverSocketId = getReceiverSocketId(receiverId);

        if (receiverSocketId)
            io.to(receiverSocketId).emit("newMessage", newMessage);

        res.status(201).json(newMessage);

    } catch (error) {
        console.log('Error in sendMessage controller', error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user.id;

        // get the conversation between sender and user to chat with and display (populate) the messages
        const conversation = await prisma.conversation.findFirst({
            where: {
                participantIds: {
                    hasEvery: [senderId, userToChatId],
                },
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    },
                },
            },
        });

        if (!conversation) return res.status(200).json([]);

        res.status(200).json(conversation.messages);

    } catch (error) {
        console.log('Error in getMessages controller', error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getUsersForSideBar = async (req, res) => {
    try {
        const authUserId = req.user.id;

        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: authUserId // don't show myself in the side bar
                },
            },
            select: {
                id: true,
                fullName: true,
                profilePic: true,
            },
        });

        res.status(200).json(users);
    } catch (error) {
        console.log('Error in getUsersForSideBar controller', error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}