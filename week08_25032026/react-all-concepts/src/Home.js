import React, { useState, useEffect } from "react";

function Home() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Home Loaded");
  }, []);

  return (
    <div>
      <h2>Home Page</h2>
      <h3>Count: {count}</h3>
      <button onClick={() => setCount(count + 1)}>Increase</button>
    </div>
  );
}

export default Home;