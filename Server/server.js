import express from "express"
import dotenv from "dotenv";
import authRoutes from "./src/Routes/auth.route.js"
import { connectDB } from "./src/lib/db.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./src/Routes/message.route.js"
import cors from "cors"
import { app, server } from "./src/lib/socket.io.js"
import groupRoutes from "./src/Routes/group.routes.js"
import videoCallRoutes from './src/Routes/videoCall.route.js';
import session from "express-session";
// import passport from "passport";
import passport from "./src/lib/passport.js";
// import { createWorkers } from "./src/lib/mediasoupConfig.js";


dotenv.config();
// await createWorkers()
// const app = express()  
const port = process.env.PORT || 5001;

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173"
];

app.use(passport.initialize());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}
))
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

app.use(express.json());
app.use(cookieParser());



app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/groups", groupRoutes)
app.use("/api/calls", videoCallRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

connectDB();

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
})
