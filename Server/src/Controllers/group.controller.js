import Group from "../Models/group.model.js";
import User from "../Models/user.model.js";
import Message from "../Models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.io.js";
import { generateAiResponse } from "./Aicontroller.js";

export const createGroup = async (req, res) => {
    try {
        const { name, description, members } = req.body;
        const createdBy = req.user._id;



        if (!name || !members || members.length < 2) {
            return res.status(400).json({ message: "Please provide all required fields and at least 2 members" });
        }

        const newGroup = new Group({
            name,
            description,
            members: [...new Set([createdBy, ...(members || [])])],
            admins: [createdBy],
            createdBy: createdBy,
        })

        await newGroup.save();
        await newGroup.populate("members", "-password");
        await newGroup.populate("admins", "-password");

        res.status(201).json(newGroup);

    } catch (error) {
        console.log("Error in createGroup controller:", error.message);
        res.status(500).json({ message: "Internal server problem" });
    }
}

export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({ members: userId }).populate("members", "-password").populate("createdBy", "-password")
            .populate("lastMessage").sort({ updatedAt: -1 });


        res.status(200).json(groups);
    } catch (error) {
        console.log("Error in getUserGroups controller:", error.message);
        res.status(500).json({ message: "Internal server problem" });
    }
}

export const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId)
            .populate("members", "-password")
            .populate("admins", "-password")
            .populate("createdBy", "-password");

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isMember = group.members.some(
            member => member._id.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        res.status(200).json(group);

    } catch (error) {
        console.error("Error fetching group in details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isMember = group.members.some(
            memberId => memberId.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        const messages = await Message.find({ groupId }).populate("senderId", "-password").sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching group messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const sendGroupMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { groupId } = req.params;
        const senderId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isMember = group.members.some(
            (m) => m.toString() === senderId.toString()
        );
        if (!isMember) {
            return res.status(403).json({ message: "Not a group member" });
        }

        let imageUrl
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            groupId,
            text,
            image: imageUrl,
        })

        await newMessage.save()
        await newMessage.populate("senderId", "-password");

        group.lastMessage = newMessage._id;
        group.lastMessageAt = new Date();
        await group.save();

        io.to(`group-${groupId}`).emit("groupMessage", newMessage)

        if (text && /@dogeshbhai\b/i.test(text)) {
            console.log("🐕 Dogesh activated in group!");

            const cleanText = text.replace(/@dogeshbhai\b/gi, "").trim();
            if (cleanText) {
                const dogeshReply = await generateAiResponse(cleanText);

                const dogeshMessage = new Message({
                    senderId: process.env.AI_AGENT_ID,
                    groupId,
                    text: dogeshReply,
                    isAiResponse: true,
                });

                await dogeshMessage.save();
                await dogeshMessage.populate("senderId", "-password");

                io.to(`group-${groupId}`).emit("groupMessage", dogeshMessage);
                console.log("🐕 Dogesh replied in group!");
            }
        }

        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in sendmsgcontroller", error.message)
        res.status(500).json({ error: "Internal server error" });
    }
}

export const addMemberToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const requesterId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isAdmin = group.admins.some(
            a => a.toString() === requesterId.toString()
        )
        if (!isAdmin) {
            return res.status(403).json({ message: "Only admins can add members" });
        }

        const alreadyMember = group.members.some(
            m => m.toString() === userId.toString()
        );
        if (alreadyMember) {
            return res.status(400).json({ message: "User already in group" });
        }

        group.members.push(userId)
        await group.save()
        await group.populate("members", "-password");

        io.to(`group-${groupId}`).emit("memberAdded", { groupId, userId });

        res.status(200).json(group);
    } catch (error) {
        console.log("Error in the addmemberstogrp Controller: ", error.message)
        res.status(500).json({ error: "Internal server error" });
    }
}

export const removeMemberFromGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const requesterId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isAdmin = group.admins.some(
            a => a.toString() === requesterId.toString()
        )
        if (!isAdmin) {
            return res.status(403).json({ message: "Only admins can add members" });
        }

        const isMember = group.members.some(
            m => m.toString() === userId.toString()
        );
        if (!isMember) {
            return res.status(400).json({ message: "User not in group" });
        }

        group.members = group.members.filter(
            (m) => m.toString() !== userId.toString()

        )

        group.admins = group.admins.filter(
            a => a.toString() !== userId.toString()
        );


        await group.save()
        await group.populate("members", "-password");

        io.to(`group-${groupId}`).emit("memberRemoved", {
            groupId, userId,
        });

        res.status(200).json(group);
    } catch (error) {
        console.error("Error removing member controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description, groupPic } = req.body;
        const requesterId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isMember = group.members.some(
            m => m.toString() === requesterId.toString()
        );
        if (!isMember) {
            return res.status(403).json({ message: "Only group members can update" });
        }

        const isAdmin = await group.admins.some(
            (a) => a.toString() === requesterId.toString()
        )
        if (!isAdmin) {
            return res.status(400).json({ message: "Admin can only update " })
        }

        if (name) group.name = name;
        if (description) group.description = description;

        if (groupPic) {
            const uploadResponse = await cloudinary.uploader.upload(groupPic);
            group.groupPic = uploadResponse.secure_url;
        }

        await group.save();
        io.to(`group-${groupId}`).emit("groupUpdated", group);

        res.status(200).json(group)
    } catch (error) {
        console.log("Error in update group controller: ", error.message)
        res.status(500)({ message: "Internal server error" })
    }
}

export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const requesterId = req.user._id

        const group = await Group.findById(groupId)
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isAdmin = await group.admins.some(
            (a) => a.toString() === requesterId.toString()
        )
        // if (!isAdmin) {
        //     return res.status(400).json({ message: "Admin can only delete " })
        // }

        const isCreator = group.createdBy.toString() === requesterId.toString();
        if (!isCreator && !isAdmin) {
            return res.status(403).json({
                message: "Only creator or admins can delete the group"
            });
        }

        await Group.findByIdAndDelete(groupId)
        await Message.deleteMany({ groupId });

        io.to(`group-${groupId}`).emit("groupDeleted", { groupId });

        res.status(200).json({ message: "Group deleted" })

    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}