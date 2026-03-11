import express from "express"
import { protectRoute } from "../Middlewares/auth.middleware.js";
import {
    createGroup, getUserGroups, getGroupDetails, getGroupMessages, sendGroupMessage, addMemberToGroup, removeMemberFromGroup, updateGroup, deleteGroup
} from "../Controllers/group.controller.js"

const router = express.Router();

// Group operations
router.post("/create", protectRoute, createGroup);
router.get("/my-groups", protectRoute, getUserGroups);
router.get("/:groupId", protectRoute, getGroupDetails);
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.post("/:groupId/send", protectRoute, sendGroupMessage);

// Member management
router.post("/:groupId/add-member", protectRoute, addMemberToGroup);
router.post("/:groupId/remove-member", protectRoute, removeMemberFromGroup);

// Group settings
router.put("/:groupId/update", protectRoute, updateGroup);
router.delete("/:groupId/delete", protectRoute, deleteGroup);

export default router;