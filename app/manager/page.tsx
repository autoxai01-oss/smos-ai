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

export default function ManagerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  // ------------------ AUTH + LOAD ------------------
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("manager") || "{}");

    // ❌ Not logged in
    if (!data?.email) {
      window.location.href = "/login";
      return;
    }

    setUser(data);

    if (data?.restaurantId) {
      fetchItems(data.restaurantId);
    }
  }, []);

  // ------------------ FETCH MENU ------------------
  const fetchItems = async (restaurantId: string) => {
    try {
      const snapshot = await getDocs(
        collection(db, "restaurants", restaurantId, "menu")
      );

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ ADD ITEM ------------------
  const addItem = async () => {
    if (!name || !price) {
      alert("Fill all fields");
      return;
    }

    try {
      await addDoc(
        collection(db, "restaurants", user.restaurantId, "menu"),
        {
          name,
          price,
          createdAt: new Date(),
        }
      );

      alert("Item Added ✅");

      setName("");
      setPrice("");

      fetchItems(user.restaurantId);
    } catch (err) {
      console.error(err);
      alert("Error adding item");
    }
  };

  // ------------------ DELETE ITEM ------------------
  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(
        doc(db, "restaurants", user.restaurantId, "menu", id)
      );

      fetchItems(user.restaurantId);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ LOADING ------------------
  if (!user) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  // ------------------ UI ------------------
  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1>🍽 Manager Dashboard</h1>
          <p>Email: {user.email}</p>
          <p>Restaurant ID: {user.restaurantId}</p>
        </div>

        <button
          style={styles.logout}
          onClick={() => {
            localStorage.removeItem("manager");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>

      {/* ADD ITEM */}
      <div style={styles.card}>
        <h2>Add Menu Item</h2>

        <input
          style={styles.input}
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button style={styles.button} onClick={addItem}>
          Add Item
        </button>
      </div>

      {/* MENU LIST */}
      <div style={styles.card}>
        <h2>📋 Menu Items</h2>

        {items.length === 0 && <p>No items yet</p>}

        {items.map((item) => (
          <div key={item.id} style={styles.row}>
            <div>
              <b>{item.name}</b>
              <p style={styles.price}>₹ {item.price}</p>
            </div>

            <button
              style={styles.delete}
              onClick={() => deleteItem(item.id)}
            >
              Delete
            </button>
          </div>
        ))}
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

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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

  logout: {
    background: "#f59e0b",
    color: "black",
    padding: "10px",
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

  price: {
    fontSize: "12px",
    color: "#94a3b8",
  },
};