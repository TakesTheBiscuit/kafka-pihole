// Importing the required modules
const WebSocketServer = require('ws');
 
// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8080 })
 
let domainsSent = [];

// Creating connection using websocket
wss.on("connection", ws => {
    console.log("new client connected");
 
    // sending message to client
    const dataToSend = [
        {'domain':'bad.com', 'type':'blocks'}
    ];
    ws.send(JSON.stringify(dataToSend));

    setInterval(()=>{
        const domainRecord = 
        {'domain':`bad-${domainsSent.length}.com`, 'type':'blocks'};
        
        domainsSent.push(domainRecord);
        

        ws.send(JSON.stringify(domainsSent));
    }, 2000);
 
    //on message from client
    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`)
    });
 
    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        console.log("the client has connected");
    });
    // handling client connection error
    ws.onerror = function () {
        console.log("Some Error occurred")
    }
});
console.log("The WebSocket server is running on port 8080");