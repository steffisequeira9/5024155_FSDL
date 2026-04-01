import React, { useRef } from "react";

function RefDemo() {
  const inputRef = useRef();

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <div>
      <h2>Ref Example</h2>
      <input ref={inputRef} type="text" placeholder="Click button" />
      <br /><br />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
}

export default RefDemo;