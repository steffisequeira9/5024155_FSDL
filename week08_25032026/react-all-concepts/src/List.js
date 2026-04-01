import React from "react";

function List() {
  const items = ["Apple", "Banana", "Mango"];

  return (
    <div>
      <h2>List (Keys Example)</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default List;