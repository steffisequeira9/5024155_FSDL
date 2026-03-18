import { useState } from "react";

// 🏎️ Car Component (PROPS)
function Car({ name, speed }) {
  return (
    <div style={{
      background: "#111",
      color: "white",
      padding: "20px",
      borderRadius: "12px",
      margin: "10px",
      boxShadow: "0 0 15px red"
    }}>
      <h2>{name}</h2>
      <p>Top Speed: {speed} km/h</p>
    </div>
  );
}

// 📝 Booking Form (FORM + EVENTS)
function BookingForm({ onBook }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onBook(name);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "5px",
          border: "none"
        }}
      />

      <button
        type="submit"
        style={{
          marginLeft: "10px",
          padding: "10px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Book Test Drive
      </button>
    </form>
  );
}

// 🔥 Main App (STATE)
function App() {
  const [message, setMessage] = useState("");

  const handleBooking = (user) => {
    setMessage(`🔥 Test Drive Booked for ${user}!`);
  };

  return (
    <div style={{
      textAlign: "center",
      background: "#7f1d1d",
      minHeight: "100vh",
      color: "white",
      padding: "20px"
    }}>
      <h1>🏎️ Ferrari Experience</h1>

      {/* COMPONENTS + PROPS */}
      <Car name="Ferrari SF90" speed="340" />
      <Car name="Ferrari LaFerrari" speed="350" />

      {/* FORM + EVENTS */}
      <BookingForm onBook={handleBooking} />

      {/* STATE OUTPUT */}
      <p style={{ marginTop: "20px", fontSize: "18px" }}>
        {message}
      </p>
    </div>
  );
}

export default App;