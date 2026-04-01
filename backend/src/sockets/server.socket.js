import {Server} from 'socket.io';

let io;

export function initSocket(httpServer) {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    io = new Server(httpServer, {
    cors: {
        origin: clientUrl,
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
