import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Prototype from './Prototype';
// Ensure App.css and Prototype.css are imported in their respective components

function App() {
  return (
    <Router>
      <Routes>
        {/* The landing page loads on the base URL */}
        <Route path="/" element={<Home />} />
        
        {/* The prototype dashboard loads on /prototype */}
        <Route path="/prototype" element={<Prototype />} />
      </Routes>
    </Router>
  );
}

export default App;