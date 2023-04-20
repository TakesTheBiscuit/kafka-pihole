import "./App.css";
import React, { useState , useEffect} from "react";

function App() {
  const [rows, setRows] = useState([]);
  const [wsClient, setWsClient] = useState([]);


  useEffect(()=>{
    const ws = new WebSocket("ws://localhost:8888");
    setWsClient(ws);

    ws.addEventListener("open", () =>{
      console.log("We are connected");
      ws.send("How are you?");
    });
     
    ws.addEventListener('message', function (event) {
        console.log('ws event', event.data);
        const newlyObserved = JSON.parse(event.data);
        setRows((prevState) => [...prevState, newlyObserved]);

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
              <th>When</th>
              <th>domain</th>
              <th>type</th>
            </tr>
          </thead>
          <>
            {rows.map((row, index) => {
              return (
                <tr key={row.domain+row.type+row.dateTimeNow}>
                  <td>{index}</td>
                  <td>{row.dateTimeNow}</td>
                  <td>{row.domain}</td>
                  <td>{row.type}</td>
                </tr>
              );
            })}
          </>
        </table>
      </div>

      <div>

        <span>The WebSocket should be listening, try hitting a blocked domain via dig or in another window and watching the table here.</span>
        
      </div>
    </>
  );
}

export default App;
