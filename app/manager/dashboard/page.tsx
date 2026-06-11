"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  getDocs
} from "firebase/firestore";

export default function ManagerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("manager") || "{}");
    setUser(data);

    if (data?.restaurantId) {
      fetchItems(data.restaurantId);
    }
  }, []);

  const fetchItems = async (restaurantId: string) => {
    const snap = await getDocs(
      collection(db, "restaurants", restaurantId, "menu")
    );

    const list = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setItems(list);
  };

  const addItem = async () => {
    if (!name || !price) return alert("Fill all fields");

    await addDoc(
      collection(db, "restaurants", user.restaurantId, "menu"),
      {
        name,
        price,
        createdAt: new Date()
      }
    );

    setName("");
    setPrice("");

    fetchItems(user.restaurantId);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h1>🍽️ Manager Panel</h1>
      <p>{user.email}</p>

      <hr />

      <h2>Add Menu Item</h2>

      <input
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <br /><br />

      <button onClick={addItem}>Add Item</button>

      <hr />

      <h2>Menu</h2>

      {items.map((item) => (
        <div key={item.id}>
          {item.name} — ₹{item.price}
        </div>
      ))}
    </div>
  );
}