"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User
} from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function AdminPage() {
  const ADMIN_EMAIL = "mistrydev89@gmail.com"; // ⚠️ PUT YOUR EMAIL HERE

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [restaurants, setRestaurants] = useState<any[]>([]);

  // 🔐 AUTH CHECK
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u && u.email === ADMIN_EMAIL) {
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔐 LOGIN
  const handleLogin = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      if (res.user.email !== ADMIN_EMAIL) {
        alert("❌ Not authorized");
        return;
      }

      setUser(res.user);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 📦 FETCH DATA
  const fetchRestaurants = async () => {
    const snapshot = await getDocs(collection(db, "restaurants"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRestaurants(data);
  };

  useEffect(() => {
    if (user) fetchRestaurants();
  }, [user]);

  // ➕ ADD
  const addRestaurant = async () => {
    if (!name || !slug) return alert("Fill all fields");

    await addDoc(collection(db, "restaurants"), {
      name,
      slug,
    });

    setName("");
    setSlug("");
    fetchRestaurants();
  };

  // ❌ DELETE
  const deleteRestaurant = async (id: string) => {
    await deleteDoc(doc(db, "restaurants", id));
    fetchRestaurants();
  };

  // ⏳ LOADING
  if (loading) return <p style={{ color: "white" }}>Loading...</p>;

  // 🔐 LOGIN UI
  if (!user) {
    return (
      <div style={styles.container}>
        <h2>🔐 Admin Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>
      </div>
    );
  }

  // ✅ ADMIN DASHBOARD
  return (
    <div style={styles.container}>
      <h1>🔥 Admin Dashboard</h1>

      <div style={styles.card}>
        <h3>Add Restaurant</h3>

        <input
          placeholder="Restaurant Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          style={styles.input}
        />

        <button onClick={addRestaurant} style={styles.addBtn}>
          Add
        </button>
      </div>

      <div style={styles.card}>
        <h3>📋 Restaurants</h3>

        {restaurants.map((r) => (
          <div key={r.id} style={styles.row}>
            <div>
              <b>{r.name}</b>
              <p style={{ opacity: 0.6 }}>{r.slug}</p>
            </div>

            <button
              onClick={() => deleteRestaurant(r.id)}
              style={styles.deleteBtn}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 UI STYLES
const styles: any = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: 40,
  },
  card: {
    background: "#1e293b",
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  input: {
    display: "block",
    width: "100%",
    marginTop: 10,
    padding: 10,
    borderRadius: 6,
    border: "none",
  },
  button: {
    marginTop: 10,
    padding: 10,
    background: "#22c55e",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  addBtn: {
    marginTop: 10,
    padding: 10,
    background: "#22c55e",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 15,
    alignItems: "center",
  },
};