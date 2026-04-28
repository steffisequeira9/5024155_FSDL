import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Signup = () => {
  const { signup } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    city: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form.name, form.email, form.password, form.city);
      alert("Signup Success");
    } catch {
      alert("Signup Failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
      <input placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
      <input placeholder="City" onChange={e => setForm({...form, city: e.target.value})} />
      <button>Signup</button>
    </form>
  );
};

export default Signup;