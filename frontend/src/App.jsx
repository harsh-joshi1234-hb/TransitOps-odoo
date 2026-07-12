import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [serverMessage, setServerMessage] = useState('Loading...');

  useEffect(() => {
    axios.get('/api/health')
      .then(response => {
        setServerMessage(response.data.message);
      })
      .catch(error => {
        console.error("Error connecting to backend", error);
        setServerMessage('Failed to connect to backend.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">TransitOps Platform</h1>
        <p className="text-gray-600 mb-2">Frontend is successfully running!</p>
        <div className="p-4 bg-green-100 text-green-700 rounded border border-green-300">
          Backend says: <strong>{serverMessage}</strong>
        </div>
      </div>
    </div>
  );
}

export default App;
