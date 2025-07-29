let ioInstance ; 

function setIO(io) {
  ioInstance = io;
}

function upDateWaitList(data) {
    if(ioInstance) 
        ioInstance.emit('waitListUpdated' , data);
    else
        console.log('No io instance found');
}


module.exports = {
    setIO ,
    upDateWaitList
}