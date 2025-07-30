const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} =require('./utils/users')

const app = express()
const server = http.createServer(app) //ovo radimo zbog socket-io
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath= path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection',(socket)=>{
    console.log('New WebSocket connection')
    
    socket.on('join',({ username , room},callback)=>{
        const {error, user } = addUser({id:socket.id, username,room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('RoomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })


        callback()
    })

    socket.on('sendMessage',(message, callback)=>{
        const user = getUser(socket.id)
    
        io.to(user.room).emit('message',generateMessage(user.username, message))
        callback()
    })

     socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username ,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback('Location shared')
    })


    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('RoomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

        
    })
})


server.listen(port,()=>{
    console.log('ovo je stranica')
})