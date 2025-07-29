const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage} = require('./utils/messages')


const app = express()
const server = http.createServer(app) //ovo radimo zbog socket-io
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath= path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection',(socket)=>{
    console.log('New WebSocket connection')
    
    socket.on('join',({username,room})=>{
        socket.join(room)

        socket.emit('message', generateMessage('Welcome'))
        socket.broadcast.to(room).emit('message',generateMessage(`${{username}} has joined!`))

    })

    socket.on('sendMessage',(message, callback)=>{
        io.emit('message',generateMessage(message))
        callback()
    })

     socket.on('sendLocation',(coords,callback)=>{
        io.emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback('Location shared')
    })


    socket.on('disconnect',()=>{
        io.emit('message',generateMessage('User has left'))
    })
})


server.listen(port,()=>{
    console.log('ovo je stranica')
})