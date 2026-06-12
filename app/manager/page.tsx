"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function ManagerDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  // ✅ AUTH CHECK + LOAD DATA
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("manager") || "null");

    if (!data) {
      router.push("/manager"); // redirect if not logged in
      return;
    }

    setUser(data);

    if (data.restaurantId) {
      fetchItems(data.restaurantId);
    }
  }, []);

  // ✅ FETCH MENU ITEMS
  const fetchItems = async (restaurantId: string) => {
    const snapshot = await getDocs(collection(db, "menu"));

    let list: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (data.restaurantId === restaurantId) {
        list.push({ id: doc.id, ...data });
      }
    });

    setItems(list);
  };

  // ✅ ADD ITEM
  const addItem = async () => {
    if (!name || !price) {
      alert("Enter name & price");
      return;
    }

    await addDoc(collection(db, "menu"), {
      name,
      price,
      restaurantId: user.restaurantId,
    });

    setName("");
    setPrice("");

    fetchItems(user.restaurantId);
  };

  // ✅ DELETE ITEM
  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, "menu", id));
    fetchItems(user.restaurantId);
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("manager");
    router.push("/manager");
  };

  if (!user) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2>🍽️ Manager Dashboard</h2>
          <p>Email: {user.email}</p>
          <p>Restaurant ID: {user.restaurantId}</p>
        </div>

        <button onClick={logout} style={styles.logout}>
          Logout
        </button>
      </div>

      {/* ADD ITEM */}
      <div style={styles.card}>
        <h3>Add Menu Item</h3>

        <input
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={styles.input}
        />

        <button onClick={addItem} style={styles.button}>
          Add Item
        </button>
      </div>

      {/* MENU LIST */}
      <div style={styles.card}>
        <h3>📋 Menu Items</h3>

        {items.length === 0 ? (
          <p>No items yet</p>
        ) : (
          items.map((item) => (
            <div key={item.id} style={styles.row}>
              <span>{item.name}</span>
              <span>₹ {item.price}</span>

              <button
                onClick={() => deleteItem(item.id)}
                style={styles.delete}
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

const styles: any = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    padding: "30px",
    color: "white",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  logout: {
    background: "red",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  input: {
    display: "block",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    width: "250px",
  },
  button: {
    background: "#22c55e",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
    padding: "10px",
    background: "#334155",
    borderRadius: "6px",
  },
  delete: {
    background: "red",
    border: "none",
    color: "white",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};