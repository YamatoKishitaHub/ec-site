import { CartItem, CartItems } from '@/types/item';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type CartContextProps = {
  cartItems: CartItems;
  addItemToCart: (item: CartItem) => void;
  changeQuantityOfItemsInCart: (itemId: number, newQuantity: number) => void;
  deleteAllItemsInCart: () => void;
};

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // セッションストレージのカートの配列
  const localStorageCartItems = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cartItems') || '[]') : [];

  // 商品情報を含むカートの配列
  const [cartItems, setCartItems] = useState<CartItems>(localStorageCartItems);

  // cartItemsが変更されたとき、セッションストレージのcartItemsも変更
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // カートに商品を追加
  const addItemToCart = (item: CartItem) => {
    const itemIsExisting = cartItems.find((cartItem) => cartItem.id === item.id);

    if (itemIsExisting) {
      // 既に商品がカートに存在する場合
      setCartItems((prevCart) =>
        prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + item.quantity } : cartItem
        )
      );
    } else {
      // 商品がカートに存在しない場合
      setCartItems((prevCart) => [...prevCart, { ...item, quantity: item.quantity }]);
    }
  };

  // カートの中の商品の量を変更
  const changeQuantityOfItemsInCart = (itemId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      // 量を0個に変更する（削除する）
      setCartItems((prevCart) => 
        prevCart.filter((cartItem) => cartItem.id !== itemId)
      )
    } else {
      // 量を新しい量に変更する
      setCartItems((prevCart) =>
        prevCart.map((cartItem) =>
          cartItem.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem
        )
      );
    }
  };

  // カートの中の商品を全て削除
  const deleteAllItemsInCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addItemToCart, changeQuantityOfItemsInCart, deleteAllItemsInCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
