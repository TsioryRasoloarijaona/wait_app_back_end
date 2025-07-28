const express = require('express') ;
const cors = require('cors') ;
/*const http = require('http');  
const { Server } = require('socket.io'); 
const waitListController = require("./controller/WaitListController");*/

const app = express() ;
const port = 3000 ;

const pingRoutes = require('./routes/pingRoutes') ;
const userRoutes = require('./routes/userRoutes');
const queueRouter = require("./routes/queueRouter");
const etablissementRouter = require("./routes/etablissementRouter");

app.use(cors());
app.use(express.json()) ; 

app.use('/' , pingRoutes) ;
app.use('/users' , userRoutes) ;
app.use("/queue", queueRouter);
app.use("/establishment", etablissementRouter);

// Créer le serveur HTTP à partir d'Express
/*const server = http.createServer(app);

// Initialiser Socket.io en lui passant le serveur HTTP
const io = new Server(server, {
  cors: { origin: "*" }, 
});

waitListController.setIO(io);  

// Gérer les connexions Socket.io
io.on('connection', (socket) => {
  console.log('Un client est connecté :', socket.id);

  socket.on('disconnect', () => {
    console.log('Client déconnecté :', socket.id);
  });
});

app.set('io', io);*/

// Démarrer le serveur HTTP (et donc Socket.io) au lieu de app.listen
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

