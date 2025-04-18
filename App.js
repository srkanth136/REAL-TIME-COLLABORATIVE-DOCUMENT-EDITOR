import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State to manage the document content
  const [documentContent, setDocumentContent] = useState("");
  const [userName, setUserName] = useState("User"); // For collaboration tracking
  const [socket, setSocket] = useState(null); // Socket connection for real-time updates

  // Set up socket connection (assuming you have a server running with Socket.IO)
  useEffect(() => {
    const newSocket = io("http://localhost:5000"); // Connect to the server (replace with your server's URL)
    setSocket(newSocket);

    // Listen for updates from other clients (real-time collaboration)
    newSocket.on("documentUpdate", (newContent) => {
      setDocumentContent(newContent);
    });

    return () => newSocket.close(); // Clean up the socket connection when the component unmounts
  }, []);

  // Handle text changes in the document
  const handleTextChange = (e) => {
    const newContent = e.target.value;
    setDocumentContent(newContent);
    
    // Emit the change to the server
    if (socket) {
      socket.emit("updateDocument", newContent); // Send the new content to the server
    }
  };

  // Handle setting the user's name (for collaborative purposes)
  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Real-Time Document Editor</h1>
        <input 
          type="text" 
          placeholder="Enter your name" 
          value={userName} 
          onChange={handleNameChange} 
        />
      </header>
      <main>
        <textarea
          value={documentContent}
          onChange={handleTextChange}
          placeholder="Start typing your document..."
          rows="20"
          cols="80"
        />
      </main>
    </div>
  );
}

export default App;
