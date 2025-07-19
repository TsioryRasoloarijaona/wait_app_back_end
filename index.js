const express = require('express') ;
const cors = require('cors') ;
const app = express() ;
const port = 3000 ;

const pingRoutes = require('./routes/pingRoutes') ;
const userRoutes = require('./routes/userRoutes')

app.use(cors());

app.use(express.json()) ; 
app.use('/' , pingRoutes) ;
app.use('/users' , userRoutes) ;



app.listen(port , ()=>{console.log(`Server is running on port ${port}`)}) ;
