"use client";

import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ManagerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const snapshot = await getDocs(collection(db, "users"));

    const user = snapshot.docs.find(
      (doc) =>
        doc.data().email === email &&
        doc.data().password === password
    );

    if (!user) {
      alert("Invalid credentials");
      return;
    }

    if (user.data().role !== "manager") {
      alert("Access denied");
      return;
    }

    localStorage.setItem("manager", JSON.stringify(user.data()));

    window.location.href = "/manager/dashboard";
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Manager Login</h2>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <br />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}