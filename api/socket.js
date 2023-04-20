// Importing the required modules
const WebSocketServer = require("ws");
const ksqldb = require("ksqldb-js");

// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8888 });

const deDupeSink = [];


// Creating connection using websocket
wss.on("connection", (ws) => {
  console.log("new client connected");

  // start reading / streaming from ksqldb
  readKsql(ws);

  //on message from client
  ws.on("message", (data) => {
    console.log(`Client has sent us: ${data}`);
  });

  // handling what to do when clients disconnects from server
  ws.on("close", () => {
    console.log("the client has disconnected");
  });
  // handling client connection error
  ws.onerror = function () {
    console.log("Some Error occurred");
  };
});
console.log("The WebSocket server is running on port 8888");

function readKsql(ws) {
  const client = new ksqldb({ ksqldbURL: "http://localhost:8088" });
  console.log('readksql..');
  client.push("SELECT ROWTIME, DOMAIN, TYPE FROM MESSAGES_LATEST EMIT CHANGES;", (data) => {
    try {
        const domainAndType = JSON.parse(data);
        let sendOverWs = true;
        
        // @todo this could be better
        // at the moment the `ksqldb client` returns both json and an array of result
        // this anonymous function is fired once per record back from the query
        if (domainAndType.length === 3) {

            // [domain.type]
            const dateTimeNow = new Date;
            
            const domainRecord = {
                dateTimeNow: domainAndType[0],
                domain: domainAndType[1],
                type: domainAndType[2]
            };

            // did we send it already? (de-dupe sink)
            deDupeSink.map(function(item){
                if (item.domain === domainRecord.domain && item.type === domainRecord.type && item.dateTimeNow === domainRecord.dateTimeNow) {
                    // already have it
                    console.log('Deduped ');
                    sendOverWs = false;
                } else {
                    // add it to dedupe sink for future
                    deDupeSink.push(domainRecord);
                }

            });


            if (sendOverWs) {
                // push the domain over the ws
                ws.send(JSON.stringify(domainRecord));
            }


        }
    } catch (error) {
        console.error(`JSON parse error` , error);
    }
    // console.log(typeof data);
    
  });
}
