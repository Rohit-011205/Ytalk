import express from "express"
import dotenv from  "dotenv" ;
import authRoutes from "./src/Routes/auth.route.js" 
import { connectDB } from "./src/lib/db.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./src/Routes/message.route.js"
import cors from "cors"
import {app,server} from "./src/lib/socket.io.js"


dotenv.config();
// const app = express()  
const port = process.env.PORT || 5001;

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb" ,extended:true}));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true,
}
))

app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes) 


app.get('/', (req, res) => {
  res.send('Hello World!')
})

connectDB();

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
})
