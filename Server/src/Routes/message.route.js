import express from "express"
import { protectRoute } from "../Middlewares/auth.middleware.js"
import { getUserForSidebar ,getMessages,sendMessage} from "../Controllers/message.controller.js"
import { getLastMessages } from "../Controllers/message.controller.js"
const router = express.Router()


router.get("/users",protectRoute,getUserForSidebar)
router.get("/last-messages", protectRoute, getLastMessages);

router.get("/:id",protectRoute,getMessages)


router.post("/send/:id",protectRoute,sendMessage)

    
export default router