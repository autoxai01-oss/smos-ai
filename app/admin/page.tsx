"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [restaurants, setRestaurants] = useState<any[]>([]);

  // 🔥 Fetch data
  const fetchRestaurants = async () => {
    const snapshot = await getDocs(collection(db, "restaurants"));
    const data: any[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRestaurants(data);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // ➕ Add
  const handleAdd = async () => {
    if (!name || !slug) {
      alert("Fill all fields");
      return;
    }

    await addDoc(collection(db, "restaurants"), {
      name,
      slug,
      createdAt: new Date(),
    });

    setName("");
    setSlug("");
    fetchRestaurants();
  };

  // 🗑 Delete
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "restaurants", id));
    fetchRestaurants();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔥 Admin Dashboard</h1>

      <div style={styles.grid}>
        {/* ADD CARD */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Add Restaurant</h2>

          <input
            placeholder="Restaurant Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Slug (e.g. kscharchoal)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={styles.input}
          />

          <button onClick={handleAdd} style={styles.addButton}>
            Add Restaurant
          </button>
        </div>

        {/* LIST CARD */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📋 Restaurants</h2>

          {restaurants.length === 0 && (
            <p style={{ opacity: 0.6 }}>No data yet</p>
          )}

          {restaurants.map((item) => (
            <div key={item.id} style={styles.item}>
              <div>
                <h3 style={styles.itemTitle}>{item.name}</h3>
                <p style={styles.itemSlug}>{item.slug}</p>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: "40px",
    fontFamily: "sans-serif",
  },

  title: {
    fontSize: "28px",
    marginBottom: "30px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "20px",
  },

  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },

  cardTitle: {
    marginBottom: "15px",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "white",
  },

  addButton: {
    width: "100%",
    padding: "12px",
    background: "#22c55e",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    marginTop: "10px",
    borderBottom: "1px solid #334155",
  },

  itemTitle: {
    margin: 0,
  },

  itemSlug: {
    margin: 0,
    fontSize: "12px",
    opacity: 0.7,
  },

  deleteButton: {
    background: "#ef4444",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
};