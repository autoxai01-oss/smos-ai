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

  // 🔥 LOAD USER
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("manager") || "{}");
    setUser(data);
  }, []);

  // 🔥 LOAD ITEMS
  useEffect(() => {
    if (!user?.restaurantId) return;

    fetchItems();
  }, [user]);

  const fetchItems = async () => {
    const snap = await getDocs(
      collection(db, "restaurants", user.restaurantId, "items")
    );

    const data: any[] = [];
    snap.forEach((doc) =>
      data.push({ id: doc.id, ...doc.data() })
    );

    setItems(data);
  };

  // ➕ ADD ITEM
  const addItem = async () => {
    if (!name || !price) return;

    await addDoc(
      collection(db, "restaurants", user.restaurantId, "items"),
      {
        name,
        price: Number(price),
      }
    );

    setName("");
    setPrice("");

    fetchItems(); // refresh
  };

  // ❌ DELETE ITEM
  const deleteItem = async (id: string) => {
    await deleteDoc(
      doc(db, "restaurants", user.restaurantId, "items", id)
    );

    fetchItems(); // refresh
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Manager Dashboard</h2>

      <p>Email: {user?.email}</p>
      <p>Restaurant ID: {user?.restaurantId}</p>

      {/* ADD ITEM */}
      <div style={{ marginTop: 20 }}>
        <h3>Add Menu Item</h3>

        <input
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button onClick={addItem}>Add Item</button>
      </div>

      {/* ITEMS LIST */}
      <div style={{ marginTop: 30 }}>
        <h3>Menu Items</h3>

        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <span>
              {item.name} - ₹{item.price}
            </span>

            <button onClick={() => deleteItem(item.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}