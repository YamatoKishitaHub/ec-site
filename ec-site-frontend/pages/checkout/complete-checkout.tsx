import RootLayout from "@/app/layout";
import { useCart } from "@/context/CartContext";
import Head from "next/head";
import { useEffect } from "react";

const completeCheckout = () => {
  const { deleteAllItemsInCart } = useCart();

  useEffect(() => {
    deleteAllItemsInCart();
  }, []);

  return (
    <RootLayout>
      <Head>
        <title>決済完了</title>
      </Head>
      <div>
        <h1 className="text-3xl font-bold mx-4">
          決済完了
        </h1>
        <div className="mx-4">
          ご購入ありがとうございました！
        </div>
      </div>
    </RootLayout>
  );
};

export default completeCheckout;
