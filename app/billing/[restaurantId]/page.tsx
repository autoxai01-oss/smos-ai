"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { useParams } from "next/navigation";

// TYPES
type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

type Order = {
  id: string;
  tableId: string;
  items: OrderItem[];
  isActive: boolean;
};

export default function Billing() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [orders, setOrders] = useState<Order[]>([]);

  // 🔥 FETCH ALL ORDERS
  useEffect(() => {
    const q = query(
      collection(db, "restaurants", restaurantId, "orders"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, "id">),
      }));
      setOrders(data);
    });

    return () => unsub();
  }, [restaurantId]);

  // 🔥 GROUP BY TABLE
  const grouped: Record<string, Order[]> = {};

  orders.forEach((order) => {
    if (!grouped[order.tableId]) {
      grouped[order.tableId] = [];
    }
    grouped[order.tableId].push(order);
  });

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl mb-6 text-center">💳 Billing Dashboard</h1>

      {Object.keys(grouped).length === 0 && (
        <p className="text-center text-gray-400">No orders</p>
      )}

      <div className="grid md:grid-cols-2 gap-6">

        {Object.entries(grouped).map(([tableId, tableOrders]) => {
          
          let total = 0;

          return (
            <div key={tableId} className="bg-gray-800 p-4 rounded">

              <h2 className="text-xl mb-3">Table: {tableId}</h2>

              {/* 🔥 ALL ORDERS */}
              {tableOrders.map((order) => (
                <div key={order.id} className="mb-3 border-t border-gray-600 pt-2">

                  {order.items.map((item, i) => {
                    const itemTotal = item.price * item.qty;
                    total += itemTotal;

                    return (
                      <div key={i} className="flex justify-between">
                        <span>{item.name} x {item.qty}</span>
                        <span>₹{itemTotal}</span>
                      </div>
                    );
                  })}

                </div>
              ))}

              {/* 🔥 TOTAL */}
              <div className="border-t border-gray-500 mt-3 pt-3 text-lg font-bold flex justify-between">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}