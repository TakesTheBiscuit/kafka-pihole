import "./App.css";
import React, { useState , useEffect} from "react";
import useWebSocket from "react-use-websocket";

function App() {
  const [rows, setRows] = useState([]);
  const [wsClient, setWsClient] = useState([]);

  useEffect(()=>{
    const ws = new WebSocket("ws://localhost:8080");
    setWsClient(ws);

    ws.addEventListener("open", () =>{
      console.log("We are connected");
      ws.send("How are you?");
    });
     
    ws.addEventListener('message', function (event) {
        console.log(event.data);
        setRows(JSON.parse(event.data));
    });
  }, []);
  


  return (
    <>
      <div className="App">
        <h1>Blocks</h1>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>domain</th>
              <th>type</th>
            </tr>
          </thead>
          <>
            {rows.map((row, index) => {
              return (
                <tr>
                  <td>{index}</td>
                  <td>{row.domain}</td>
                  <td>{row.type}</td>
                </tr>
              );
            })}
          </>
        </table>
      </div>

      <div>

        {/* <button
          onClick={handleClickSendMessage}
          disabled={readyState !== ReadyState.OPEN}
        >
          Click Me to send 'Hello'
        </button> */}
        <span>The WebSocket is currently ?</span>
        
      </div>
    </>
  );
}

export default App;
