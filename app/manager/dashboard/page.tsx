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
  const [tables, setTables] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const [newTable, setNewTable] = useState("");

  const router = useRouter();

  // 🔐 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login");

      const q = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );

      const snap = await getDocs(q);

      if (snap.empty) return router.push("/login");

      const data = snap.docs[0].data();

      if (data.role !== "manager") return router.push("/login");

      setRestaurantId(data.restaurantId);
      fetchMenu(data.restaurantId);
      fetchTables(data.restaurantId);
    });

    return () => unsub();
  }, []);

  // 📦 FETCH MENU
  const fetchMenu = async (rid: string) => {
    const q = query(collection(db, "menu"), where("restaurantId", "==", rid));
    const snap = await getDocs(q);
    setMenu(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // 📦 FETCH TABLES
  const fetchTables = async (rid: string) => {
    const q = query(collection(db, "tablePins"), where("restaurantId", "==", rid));
    const snap = await getDocs(q);
    setTables(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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

  // ❌ DELETE MENU ITEM
  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, "menu", id));
    fetchMenu(restaurantId);
  };

  // ➕ ADD TABLE
  const addTable = async () => {
    if (!newTable) {
      alert("Enter table name");
      return;
    }

    await setDoc(doc(db, "tablePins", restaurantId + "_" + newTable), {
      restaurantId,
      tableNumber: newTable,
      pin: ""
    });

    setNewTable("");
    fetchTables(restaurantId);
  };

  // 💾 UPDATE PIN
  const updatePin = async (table: string, pin: string) => {
    if (pin.length !== 4) {
      alert("PIN must be 4 digits");
      return;
    }

    await setDoc(doc(db, "tablePins", restaurantId + "_" + table), {
      restaurantId,
      tableNumber: table,
      pin
    });
  };

  // ❌ DELETE TABLE
  const deleteTable = async (id: string) => {
    await deleteDoc(doc(db, "tablePins", id));
    fetchTables(restaurantId);
  };

  // 🔥 RESET TABLE (MAIN FEATURE)
  const resetTable = async (tableNumber: string) => {
    const confirmReset = confirm(
      `Are you sure you want to reset ${tableNumber}?\n\nThis will clear all orders and reset the table.`
    );

    if (!confirmReset) return;

    try {
      // 🔥 GET ORDERS OF THIS TABLE
      const q = query(
        collection(db, "restaurants", restaurantId, "orders"),
        where("tableId", "==", tableNumber)
      );

      const snap = await getDocs(q);

      // 🔥 DELETE ALL ORDERS
      const deletePromises = snap.docs.map((d) =>
        deleteDoc(
          doc(db, "restaurants", restaurantId, "orders", d.id)
        )
      );

      await Promise.all(deletePromises);

      // 🔐 RESET PIN
      await setDoc(
        doc(db, "tablePins", restaurantId + "_" + tableNumber),
        {
          restaurantId,
          tableNumber,
          pin: ""
        }
      );

      alert(`Table ${tableNumber} reset successfully`);

    } catch (err) {
      console.error(err);
      alert("Error resetting table");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-6">

      <h1 className="text-4xl font-bold text-center mb-10">
        👨‍🍳 Manager Dashboard
      </h1>

      {/* ADD MENU */}
      <div className="bg-gray-900 p-6 rounded-2xl mb-8 border border-gray-800">
        <h2 className="text-xl mb-4">➕ Add Menu Item</h2>

        <div className="flex flex-wrap gap-3">

          <input
            placeholder="Item Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="p-3 bg-gray-800 rounded-lg"
          />

          <input
            placeholder="Price"
            value={price}
            onChange={(e)=>setPrice(e.target.value)}
            className="p-3 bg-gray-800 rounded-lg"
          />

          <input
            placeholder="Category"
            value={category}
            onChange={(e)=>setCategory(e.target.value)}
            className="p-3 bg-gray-800 rounded-lg"
          />

          <button
            onClick={addItem}
            className="bg-green-500 px-5 py-3 rounded-lg"
          >
            Add
          </button>

        </div>
      </div>

      {/* MENU LIST */}
      <div className="bg-gray-900 p-6 rounded-2xl mb-8 border border-gray-800">
        <h2 className="text-xl mb-4">📋 Menu Items</h2>

        <div className="space-y-3">
          {menu.map(item => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-gray-800 p-4 rounded-xl"
            >
              <span>{item.name} - ₹{item.price}</span>

              <button
                onClick={()=>deleteItem(item.id)}
                className="bg-red-500 px-3 py-1 rounded-lg"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* TABLE MANAGEMENT */}
      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">

        <h2 className="text-xl mb-4">🔐 Tables</h2>

        <div className="flex gap-3 mb-4">
          <input
            placeholder="Add Table (T1)"
            value={newTable}
            onChange={(e)=>setNewTable(e.target.value)}
            className="p-3 bg-gray-800 rounded-lg"
          />

          <button
            onClick={addTable}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            Add Table
          </button>
        </div>

        <div className="space-y-3">
          {tables.map(t => (
            <div
              key={t.id}
              className="flex justify-between items-center bg-gray-800 p-4 rounded-xl"
            >

              <span className="font-semibold text-lg">
                {t.tableNumber}
              </span>

              <input
                placeholder="4-digit PIN"
                defaultValue={t.pin}
                onBlur={(e)=>updatePin(t.tableNumber, e.target.value)}
                className="p-2 bg-gray-700 rounded-lg w-28 text-center"
              />

              <div className="flex gap-2">

                <button
                  onClick={() => resetTable(t.tableNumber)}
                  className="bg-yellow-500 px-3 py-1 rounded-lg"
                >
                  Reset
                </button>

                <button
                  onClick={()=>deleteTable(t.id)}
                  className="bg-red-500 px-3 py-1 rounded-lg"
                >
                  Delete
                </button>

              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}