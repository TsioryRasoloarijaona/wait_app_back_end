const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const websocketManager = require('./helper/WebsocketManager');

const app = express();
const port = 3000;


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});


websocketManager.setIO(io);


io.on('connection', (socket) => {
  console.log('Un client est connecté :', socket.id);

  socket.on('disconnect', () => {
    console.log('Client déconnecté :', socket.id);
  });
});

app.set('io', io);


app.use(cors());
app.use(express.json());


const pingRoutes = require('./routes/pingRoutes');
const userRoutes = require('./routes/userRoutes');
const waitListRoutes = require("./routes/waitListRoutes");
const etablissementRouter = require("./routes/etablissementRouter");

app.use('/', pingRoutes);
app.use('/users', userRoutes);
app.use('/wait', waitListRoutes);
app.use('/establishment', etablissementRouter);


server.listen(port, () => {
  console.log(`Server is running with HTTP and Socket.IO on port ${port}`);
});
