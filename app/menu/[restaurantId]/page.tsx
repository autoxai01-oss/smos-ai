"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { useParams, useSearchParams } from "next/navigation";
import { addToCart, getCart, updateQty } from "@/lib/cart";

type MenuItem = {
  id: string;
  name: string;
  price: number;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export default function CustomerMenu() {
  const params = useParams();
  const searchParams = useSearchParams();

  const restaurantId = params.restaurantId as string;
  const table = searchParams.get("table");

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [enteredPin, setEnteredPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // 🔐 VERIFY PIN
  const verifyPin = async () => {
    const q = query(
      collection(db, "restaurants", restaurantId, "tablePins"),
      where("tableNumber", "==", table)
    );

    const snap = await getDocs(q);

    if (snap.empty) return alert("Invalid table");

    const data = snap.docs[0].data();

    if (data.pin === enteredPin) {
      setVerified(true);
    } else {
      alert("Wrong PIN");
    }
  };

  // 🍔 LOAD MENU
  useEffect(() => {
    if (!verified) return;

    const q = query(
      collection(db, "restaurants", restaurantId, "menu")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMenu(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MenuItem, "id">),
        }))
      );
    });

    return () => unsub();
  }, [verified, restaurantId]);

  // 🔥 PLACE ORDER
  const placeOrder = async () => {
    const cart = getCart() as CartItem[];

    if (cart.length === 0) return alert("Cart empty");

    await addDoc(
      collection(db, "restaurants", restaurantId, "orders"),
      {
        tableId: table,
        items: cart.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: item.price
        })),
        status: "pending",
        createdAt: serverTimestamp()
      }
    );

    localStorage.removeItem("cart");
    setRefresh(!refresh);

    alert("✅ Order placed!");
  };

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-gray-900 p-6 rounded-xl w-80 text-center">
          <h1 className="text-xl mb-3">🔐 Table {table}</h1>

          <input
            placeholder="Enter PIN"
            value={enteredPin}
            onChange={(e) => setEnteredPin(e.target.value)}
            className="w-full p-2 mb-3 bg-gray-800 rounded"
          />

          <button
            onClick={verifyPin}
            className="w-full bg-green-500 p-2 rounded"
          >
            Enter Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-32">

      <h1 className="text-3xl mb-6 text-center">🍽 Menu</h1>

      {menu.map((item) => {
        const cart = getCart() as CartItem[];
        const cartItem = cart.find((i) => i.id === item.id);

        return (
          <div key={item.id} className="bg-gray-800 p-4 mb-3 rounded flex justify-between">
            <div>
              <p>{item.name}</p>
              <p className="text-gray-400">₹{item.price}</p>
            </div>

            {!cartItem ? (
              <button onClick={() => { addToCart(item); setRefresh(!refresh); }}>
                Add
              </button>
            ) : (
              <div>
                <button onClick={() => { updateQty(item.id, "dec"); setRefresh(!refresh); }}>-</button>
                {cartItem.qty}
                <button onClick={() => { updateQty(item.id, "inc"); setRefresh(!refresh); }}>+</button>
              </div>
            )}
          </div>
        );
      })}

      <div className="fixed bottom-0 w-full p-4 bg-black">
        <button onClick={placeOrder} className="w-full bg-green-500 p-3 rounded">
          Place Order
        </button>
      </div>

    </div>
  );
}