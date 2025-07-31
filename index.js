import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io';
import {setIO } from './helper/WebsocketManager.js'
import pingRoutes from './routes/pingRoutes.js'
import userRoutes from './routes/userRoutes.js'
import waitListRoutes from "./routes/waitListRoutes.js"
import etablissementRouter from "./routes/etablissementRouter.js"


const app = express();
const port = 3000;


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});


setIO(io)


io.on('connection', (socket) => {
  console.log('Un client est connecté :', socket.id);

  socket.on('disconnect', () => {
    console.log('Client déconnecté :', socket.id);
  });
});

app.set('io', io);


app.use(cors());
app.use(express.json());






app.use('/', pingRoutes);
app.use('/users', userRoutes);
app.use('/wait', waitListRoutes);
app.use('/establishment', etablissementRouter);


server.listen(port, () => {
  console.log(`Server is running with HTTP and Socket.IO on port ${port}`);
});
