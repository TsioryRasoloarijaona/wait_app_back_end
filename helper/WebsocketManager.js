let ioInstance;
const connectedUser = new Map();

function setIO(io) {
  ioInstance = io;
}

function upDateWaitList(data) {
  if (ioInstance) ioInstance.emit("waitListUpdated", data);
  else console.log("No io instance found");
}

function sendToAdmin(userId , event , playload) {
    const socketId = connectedUser.get(userId)
    if(socketId && ioInstance) {
        ioInstance.to(socketId).emit(event , playload)
    }
}

function registerUser(userId , socketId) {
    connectedUser.set(userId , socketId)
}

function unregisterUser(socketId) {
  for (const [uid, sid] of connectedUser.entries()) {
    if (sid === socketId) {
      connectedUser.delete(uid);
      break;
    }
  }
}

export { setIO, upDateWaitList , registerUser , unregisterUser , sendToAdmin};
