"use client";

import { useEffect, useState } from "react";
import { getCart } from "@/lib/cart";
import { useRouter, useSearchParams } from "next/navigation";

export default function CartBar({ restaurantId }: { restaurantId: string }) {
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();
  const params = useSearchParams();
  const table = params.get("table");

  useEffect(() => {
    const interval = setInterval(() => {
      setCart(getCart());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (cart.length === 0) return null;

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 flex justify-between">
      <span>{cart.length} items | ₹{total}</span>
      <button
        onClick={() =>
          router.push(`/checkout/${restaurantId}?table=${table}`)
        }
        className="bg-green-500 px-4 py-2 rounded"
      >
        View Cart
      </button>
    </div>
  );
}