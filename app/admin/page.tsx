"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function AdminPage() {
  // ------------------ RESTAURANTS ------------------
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [restaurants, setRestaurants] = useState<any[]>([]);

  // ------------------ MANAGERS ------------------
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [managerRestaurantId, setManagerRestaurantId] = useState("");

  // ------------------ FETCH RESTAURANTS ------------------
  const fetchRestaurants = async () => {
    const snapshot = await getDocs(collection(db, "restaurants"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRestaurants(data);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // ------------------ ADD RESTAURANT ------------------
  const addRestaurant = async () => {
    if (!name || !slug) {
      alert("Fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "restaurants"), {
        name,
        slug,
        createdAt: new Date(),
      });

      alert("Restaurant Added ✅");

      setName("");
      setSlug("");
      fetchRestaurants();
    } catch (err) {
      console.error(err);
      alert("Error adding restaurant");
    }
  };

  // ------------------ DELETE RESTAURANT ------------------
  const deleteRestaurant = async (id: string) => {
    await deleteDoc(doc(db, "restaurants", id));
    fetchRestaurants();
  };

  // ------------------ ADD MANAGER ------------------
  const addManager = async () => {
    if (!managerEmail || !managerPassword || !managerRestaurantId) {
      alert("Fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        email: managerEmail,
        password: managerPassword,
        role: "manager",
        restaurantId: managerRestaurantId,
        createdAt: new Date(),
      });

      alert("Manager Added ✅");

      setManagerEmail("");
      setManagerPassword("");
      setManagerRestaurantId("");
    } catch (err) {
      console.error(err);
      alert("Error adding manager");
    }
  };

  // ------------------ UI ------------------
  return (
    <div style={styles.container}>
      <h1>🔥 Admin Dashboard</h1>

      {/* ------------------ ADD RESTAURANT ------------------ */}
      <div style={styles.card}>
        <h2>Add Restaurant</h2>

        <input
          style={styles.input}
          placeholder="Restaurant Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Slug (e.g. kscharchoal)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        <button style={styles.button} onClick={addRestaurant}>
          Add Restaurant
        </button>
      </div>

      {/* ------------------ RESTAURANT LIST ------------------ */}
      <div style={styles.card}>
        <h2>📋 Restaurants</h2>

        {restaurants.map((r) => (
          <div key={r.id} style={styles.row}>
            <div>
              <b>{r.name}</b>
              <p style={styles.slug}>{r.slug}</p>
              <p style={styles.id}>ID: {r.id}</p>
            </div>

            <button
              style={styles.delete}
              onClick={() => deleteRestaurant(r.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* ------------------ ADD MANAGER ------------------ */}
      <div style={styles.card}>
        <h2>👨‍💼 Add Manager</h2>

        <input
          style={styles.input}
          placeholder="Manager Email"
          value={managerEmail}
          onChange={(e) => setManagerEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={managerPassword}
          onChange={(e) => setManagerPassword(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Restaurant ID (copy from above)"
          value={managerRestaurantId}
          onChange={(e) => setManagerRestaurantId(e.target.value)}
        />

        <button style={styles.button} onClick={addManager}>
          Add Manager
        </button>
      </div>
    </div>
  );
}

// ------------------ STYLES ------------------

const styles: any = {
  container: {
    padding: "40px",
    background: "#0f172a",
    minHeight: "100vh",
    color: "white",
  },

  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
  },

  input: {
    display: "block",
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
  },

  button: {
    background: "#22c55e",
    color: "black",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  delete: {
    background: "#ef4444",
    color: "white",
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#334155",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "6px",
  },

  slug: {
    fontSize: "12px",
    opacity: 0.7,
  },

  id: {
    fontSize: "11px",
    color: "#94a3b8",
  },
};