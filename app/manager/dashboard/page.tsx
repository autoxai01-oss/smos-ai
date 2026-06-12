"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ManagerLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const snapshot = await getDocs(collection(db, "users"));

    let foundUser: any = null;

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (
        data.email === email &&
        data.password === password &&
        data.role === "manager"
      ) {
        foundUser = data;
      }
    });

    if (!foundUser) {
      alert("❌ Invalid credentials");
      return;
    }

    localStorage.setItem("manager", JSON.stringify(foundUser));
    router.push("/manager/dashboard");
  };

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>🔐 Manager Login</h1>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}