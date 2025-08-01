import express from 'express'
import {sendToAdmin} from '../helper/WebsocketManager.js'
const router = express.Router() ;

router.post("/ping", (req, res) => {
   const message = {
      message : 'pon ping'
   }
   sendToAdmin('688bd6ce8a90ea9a2c61e803', 'admin' ,message )
   res.send("pong") ;
});


export default router ;