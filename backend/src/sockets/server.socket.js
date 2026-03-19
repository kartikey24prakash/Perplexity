import {Server} from 'socket.io';

let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
})
    console.log("socket.io server is RUNNING")
    io.on('connection',(socket) => {
        console.log("socket is connected" + socket.id)
    })
}

export function getId(){
    if(!io){
        throw new Error("socket.io not initia")

    }
    return io;
}