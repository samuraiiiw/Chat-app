const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#messageInput')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

const { username,room } = Qs.parse(location.search,{iqnoreQueryPrefix:true})

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('locationMessage',(message)=>{
    const html = Mustache.render(locationTemplate,{
        url:message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message = $messageFormInput.value
    
    socket.emit('sendMessage',message, (message)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        console.log('The message was delivered', message)
    })
})

$sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{ 
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location is shared')
        })
    })
})

socket.emit('join',{username,room})