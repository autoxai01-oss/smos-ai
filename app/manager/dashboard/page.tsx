"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  setDoc
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ManagerDashboard() {
  const [restaurantId, setRestaurantId] = useState("");
  const [menu, setMenu] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const router = useRouter();

  // 🔢 FIXED TABLE LIST
  const tables = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10"];

  // 🔐 AUTH CHECK
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const q = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        router.push("/login");
        return;
      }

      const data = snap.docs[0].data();

      if (data.role !== "manager") {
        router.push("/login");
        return;
      }

      setRestaurantId(data.restaurantId);
      fetchMenu(data.restaurantId);
    });

    return () => unsub();
  }, []);

  // 📦 FETCH MENU
  const fetchMenu = async (rid: string) => {
    const q = query(
      collection(db, "menu"),
      where("restaurantId", "==", rid)
    );

    const snap = await getDocs(q);

    const items = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    setMenu(items);
  };

  // ➕ ADD MENU ITEM
  const addItem = async () => {
    if (!name || !price || !category) {
      alert("Fill all fields");
      return;
    }

    await addDoc(collection(db, "menu"), {
      name,
      price: Number(price),
      category,
      restaurantId
    });

    setName("");
    setPrice("");
    setCategory("");

    fetchMenu(restaurantId);
  };

  // ❌ DELETE ITEM
  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, "menu", id));
    fetchMenu(restaurantId);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl font-bold mb-6 text-center">
        👨‍🍳 Manager Dashboard
      </h1>

      {/* ➕ ADD MENU */}
      <div className="bg-gray-900 p-4 rounded mb-6 flex flex-wrap gap-2">

        <input
          className="p-2 bg-gray-800 rounded"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="p-2 bg-gray-800 rounded"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          className="p-2 bg-gray-800 rounded"
          placeholder="Category (Drinks, Main Course)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <button
          onClick={addItem}
          className="bg-green-500 px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* 📋 MENU LIST */}
      <div className="bg-gray-900 p-4 rounded">

        <h2 className="text-xl mb-4">Menu Items</h2>

        {menu.length === 0 && (
          <p className="text-gray-400">No items yet</p>
        )}

        {menu.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-gray-800 p-3 mb-2 rounded"
          >
            <div>
              <p className="font-semibold">
                {item.name} - ₹{item.price}
              </p>
              <p className="text-sm text-gray-400">
                {item.category}
              </p>
            </div>

            <button
              onClick={() => deleteItem(item.id)}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}

      </div>

      {/* 🔐 TABLE PIN SYSTEM (FIXED TABLES) */}
      <div className="bg-gray-900 p-4 rounded mt-6">

        <h2 className="text-xl mb-4">🔐 Table PIN Control</h2>

        {tables.map((table) => (
          <div
            key={table}
            className="flex justify-between items-center bg-gray-800 p-3 mb-2 rounded"
          >
            
            <span className="font-semibold">{table}</span>

            <button
              onClick={async () => {
                const pin = Math.floor(1000 + Math.random() * 9000).toString();

                await setDoc(doc(db, "tablePins", restaurantId + "_" + table), {
                  restaurantId,
                  tableNumber: table,
                  pin,
                  updatedAt: new Date()
                });

                alert(`${table} PIN: ${pin}`);
              }}
              className="bg-yellow-500 px-4 py-1 rounded"
            >
              Generate PIN
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}