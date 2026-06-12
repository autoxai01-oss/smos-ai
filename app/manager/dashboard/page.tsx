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

  // ➕ ADD MENU
  const addItem = async () => {
    if (!name || !price || !category) return;

    await addDoc(collection(db, "menu"), {
      name,
      price: Number(price),
      category,
      restaurantId
    });

    setName(""); setPrice(""); setCategory("");
    fetchMenu(restaurantId);
  };

  // ❌ DELETE MENU
  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, "menu", id));
    fetchMenu(restaurantId);
  };

  // ➕ ADD TABLE
  const addTable = async () => {
    if (!newTable) return;

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

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl mb-6 text-center">👨‍🍳 Manager Dashboard</h1>

      {/* MENU */}
      <div className="bg-gray-900 p-4 rounded mb-6">
        <input placeholder="Item" value={name} onChange={(e)=>setName(e.target.value)} className="p-2 bg-gray-800 mr-2"/>
        <input placeholder="Price" value={price} onChange={(e)=>setPrice(e.target.value)} className="p-2 bg-gray-800 mr-2"/>
        <input placeholder="Category" value={category} onChange={(e)=>setCategory(e.target.value)} className="p-2 bg-gray-800 mr-2"/>
        <button onClick={addItem} className="bg-green-500 px-3 py-1">Add</button>
      </div>

      {/* MENU LIST */}
      {menu.map(item=>(
        <div key={item.id} className="bg-gray-800 p-3 mb-2 flex justify-between">
          {item.name} - ₹{item.price}
          <button onClick={()=>deleteItem(item.id)} className="bg-red-500 px-2">X</button>
        </div>
      ))}

      {/* TABLE SECTION */}
      <div className="bg-gray-900 p-4 rounded mt-6">

        <h2 className="text-xl mb-4">🔐 Tables</h2>

        <input
          placeholder="Add Table (T1)"
          value={newTable}
          onChange={(e)=>setNewTable(e.target.value)}
          className="p-2 bg-gray-800 mr-2"
        />
        <button onClick={addTable} className="bg-blue-500 px-3 py-1">Add Table</button>

        {tables.map(t=>(
          <div key={t.id} className="bg-gray-800 p-3 mt-2 flex justify-between items-center">
            
            <span>{t.tableNumber}</span>

            <input
              placeholder="Enter PIN"
              defaultValue={t.pin}
              onBlur={(e)=>updatePin(t.tableNumber, e.target.value)}
              className="p-1 bg-gray-700 mx-2"
            />

            <button onClick={()=>deleteTable(t.id)} className="bg-red-500 px-2">
              Delete
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}