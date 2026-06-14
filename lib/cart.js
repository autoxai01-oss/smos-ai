export const getCart = () => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("cart")) || [];
};

export const saveCart = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

export const addToCart = (item) => {
  let cart = getCart();

  const exist = cart.find(i => i.id === item.id);

  if (exist) {
    cart = cart.map(i =>
      i.id === item.id ? { ...i, qty: i.qty + 1 } : i
    );
  } else {
    cart.push({ ...item, qty: 1 });
  }

  saveCart(cart);
};

export const clearCart = () => {
  localStorage.removeItem("cart");
};