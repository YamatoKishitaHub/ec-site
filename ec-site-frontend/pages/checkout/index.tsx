import RootLayout from "@/app/layout";
import { loadStripe, StripeElementsOptions, Appearance } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Head from "next/head";
import { useEffect, useState } from "react";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { useRouter } from "next/router";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { CardMedia, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

// https://stripe.com/docs/payments/quickstart?client=next

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const index = () => {
  const router = useRouter();

  const { user } = useUser();
  const { cartItems } = useCart();

  // サインインしていなかった場合、サインインしてからリダイレクト
  useEffect(() => {
    if (Object.keys(user).length === 0) {
      router.push({
        pathname: '/auth/signin',
        query: { fromPage: router.pathname },
      });
    }
  }, []);

  // カートの中の商品の合計金額を求める
  const calculateTotalPrice = () => {
    return (
      cartItems.reduce((totalPrice, cartItem) => {
        return totalPrice + cartItem.attributes.price * cartItem.quantity;
      }, 0)
    );
  };

  // Stripe
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: "xl-tshirt" }] }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  const appearance: Appearance = {
    theme: 'stripe',
  };

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <RootLayout>
      <Head>
        <title>決済</title>
      </Head>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold mx-4">
          決済
        </h1>

        <div className="flex flex-col sm:flex-row mx-4 gap-4">
          {/* カート確認 */}
          <div className="flex flex-col sm:w-1/2 gap-2">
            <div>
              {cartItems.map((cartItem, index) => (
                <div className={"flex py-4 gap-4 border-b-2 " + (index === 0 && "border-t-2")} key={cartItem.id}>
                  <div className="mx-4">
                    <Link
                      href={{
                        pathname: "/item/" + cartItem.attributes.name,
                        query: {itemId: cartItem.id},
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={process.env.NEXT_PUBLIC_API_URL + cartItem.attributes.image.data[0].attributes.url}
                        alt={cartItem.attributes.name + "画像0"}
                        className="w-16 h-20 border"
                      />
                    </Link>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl text-blue-500">
                      <Link
                        href={{
                          pathname: "/item/" + cartItem.attributes.name,
                          query: {itemId: cartItem.id},
                        }}
                      >
                        {cartItem.attributes.name}
                      </Link>
                    </h2>
                    <div className="flex gap-4">
                      <h3 className="text-xl text-pink-700">
                        ¥{cartItem.attributes.price.toLocaleString()}
                      </h3>
                      <div className="flex items-center gap-2">
                        <FormControl size="small">
                          <InputLabel id="quantity-select-label">数量</InputLabel>
                          <Select
                            labelId="quantity-select-label"
                            id="quantity-select"
                            value={cartItem.quantity}
                            label="quantity"
                            defaultValue={cartItem.quantity}
                          >
                            <MenuItem key={0} value={cartItem.quantity}>{cartItem.quantity}</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              <div className="flex text-2xl">
                <div>
                  合計（{cartItems.length}個の商品）：
                </div>
                <div className="text-pink-700">
                  ¥{calculateTotalPrice().toLocaleString()}
                </div>
              </div>
          </div>

          {/* Stripe決済フォーム */}
          <div className="flex flex-col sm:w-1/2 gap-4">
            <div>
              実際に請求されることはないのでご安心ください。<br />テスト用のクレジットカード番号を使用したい場合、「4242 4242 4242 4242」などをご入力ください。
            </div>
            {clientSecret && (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default index;
