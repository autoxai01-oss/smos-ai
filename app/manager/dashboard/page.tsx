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

export default function Dashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  // 🔥 IMPORTANT: SAME ID AS YOUR MENU LINK
  const restaurantId = "Fx59BXJH0zMJnqVSKZdS";

  // ✅ LOAD MENU ITEMS
  const loadItems = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "restaurants", restaurantId, "items")
      );

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setItems(data);
    } catch (err) {
      console.error("Error loading items:", err);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // ✅ ADD ITEM
  const addItem = async () => {
    if (!name || !price) {
      alert("Enter name & price");
      return;
    }

    try {
      await addDoc(
        collection(db, "restaurants", restaurantId, "items"),
        {
          name,
          price,
        }
      );

      setName("");
      setPrice("");
      loadItems();
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  // ✅ DELETE ITEM
  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(
        doc(db, "restaurants", restaurantId, "items", id)
      );
      loadItems();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  return (
    <div style={{ padding: 30, color: "white" }}>
      <h1>Manager Dashboard</h1>

      <p>Restaurant ID: {restaurantId}</p>

      {/* ADD ITEM */}
      <div
        style={{
          marginTop: 20,
          padding: 20,
          background: "#1e293b",
          borderRadius: 10,
        }}
      >
        <h3>Add Menu Item</h3>

        <input
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            marginRight: 10,
            padding: 10,
            borderRadius: 5,
          }}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{
            marginRight: 10,
            padding: 10,
            borderRadius: 5,
          }}
        />

        <button
          onClick={addItem}
          style={{
            background: "green",
            color: "white",
            padding: "10px 20px",
            borderRadius: 5,
          }}
        >
          Add Item
        </button>
      </div>

      {/* MENU LIST */}
      <div
        style={{
          marginTop: 30,
          padding: 20,
          background: "#1e293b",
          borderRadius: 10,
        }}
      >
        <h3>Menu Items</h3>

        {items.length === 0 ? (
          <p>No items available</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
                padding: 10,
                background: "#334155",
                borderRadius: 5,
              }}
            >
              <span>
                {item.name} — ₹{item.price}
              </span>

              <button
                onClick={() => deleteItem(item.id)}
                style={{
                  background: "red",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: 5,
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}