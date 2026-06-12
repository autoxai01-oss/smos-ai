"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ManagerLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email & password");
      return;
    }

    setLoading(true);

    try {
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

      if (foundUser) {
        console.log("LOGIN SUCCESS:", foundUser);

        // Save login session
        localStorage.setItem("manager", JSON.stringify(foundUser));

        // Redirect to dashboard
        router.push("/manager/dashboard");
      } else {
        alert("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔐 Manager Login</h2>

      <div style={styles.card}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "white",
    marginBottom: "20px",
  },
  card: {
    background: "#1e293b",
    padding: "30px",
    borderRadius: "10px",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    outline: "none",
  },
  button: {
    padding: "10px",
    background: "#22c55e",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
};