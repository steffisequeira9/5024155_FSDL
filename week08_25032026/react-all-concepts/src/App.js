import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Home from "./Home";
import About from "./About";
import List from "./List";
import RefDemo from "./Refdemo";

function App() {
  return (
    <Router>
      <div>
        <h1>React Concepts Project</h1>

        <nav>
          <Link to="/">Home</Link> |{" "}
          <Link to="/about">About</Link> |{" "}
          <Link to="/list">List</Link> |{" "}
          <Link to="/ref">Ref</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/list" element={<List />} />
          <Route path="/ref" element={<RefDemo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;