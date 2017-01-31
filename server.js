const SERVER_PORT_NUMBER = process.env.PORT || 8080
const express = require('express')
app= express()
app.use(express.static('public'))
app.listen(SERVER_PORT_NUMBER, function(){
  console.log('server is listening in on ' + SERVER_PORT_NUMBER)
});