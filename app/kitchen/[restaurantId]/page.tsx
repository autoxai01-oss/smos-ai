"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc
} from "firebase/firestore";
import { useParams } from "next/navigation";

// TYPES
type OrderItem = {
  id: string;
  name: string;
  qty: number;
};

type Order = {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: string;
  isActive: boolean;
  createdAt?: any;
};

export default function Kitchen() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [orders, setOrders] = useState<Order[]>([]);

  // 🔥 REALTIME FETCH
  useEffect(() => {
    const q = query(
      collection(db, "restaurants", restaurantId, "orders"),
      orderBy("createdAt", "asc") // 🔥 IMPORTANT (timeline order)
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

  // 🔥 GROUP BY TABLE (NO MERGE)
  const groupedOrders: Record<string, Order[]> = {};

  orders.forEach((order) => {
    if (!groupedOrders[order.tableId]) {
      groupedOrders[order.tableId] = [];
    }
    groupedOrders[order.tableId].push(order);
  });

  // 🔄 UPDATE STATUS
  const updateStatus = async (id: string, status: string) => {
    await updateDoc(
      doc(db, "restaurants", restaurantId, "orders", id),
      { status }
    );
  };

  // 🔥 CLOSE FULL TABLE
  const closeTable = async (tableId: string) => {
    const tableOrders = orders.filter(o => o.tableId === tableId);

    for (const order of tableOrders) {
      await updateDoc(
        doc(db, "restaurants", restaurantId, "orders", order.id),
        {
          status: "served",
          isActive: false,
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl mb-6 text-center">👨‍🍳 Kitchen Dashboard</h1>

      {Object.keys(groupedOrders).length === 0 && (
        <p className="text-center text-gray-400">No orders yet</p>
      )}

      <div className="grid md:grid-cols-3 gap-4">

        {Object.entries(groupedOrders).map(([tableId, tableOrders]) => (
          <div key={tableId} className="bg-gray-800 p-4 rounded">

            <h2 className="text-xl mb-3">Table: {tableId}</h2>

            {/* 🔥 TIMELINE ORDERS */}
            {tableOrders.map((order) => (
              <div
                key={order.id}
                className="mb-3 border-t border-gray-600 pt-2"
              >
                <p className="text-sm text-gray-400 mb-1">
                  Order #{order.id.slice(0, 5)}
                </p>

                {order.items.map((item, i) => (
                  <p key={i}>
                    {item.name} x {item.qty}
                  </p>
                ))}
              </div>
            ))}

            {/* 🔥 ACTION BUTTONS */}
            <div className="flex gap-2 mt-3">

              <button
                onClick={() => {
                  tableOrders.forEach(o =>
                    updateStatus(o.id, "preparing")
                  );
                }}
                className="bg-blue-500 px-3 py-1 rounded"
              >
                Start
              </button>

              <button
                onClick={() => closeTable(tableId)}
                className="bg-green-500 px-3 py-1 rounded"
              >
                Done
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}