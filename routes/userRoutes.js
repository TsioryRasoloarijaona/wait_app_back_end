const express = require('express') ;
const router = express.Router() ;
const controller = require('../controller/userController') ;

router.post('/email-password-register' , controller.emailPasswordRegister)



module.exports = router;