import RootLayout from "@/app/layout";
import { useCart } from "@/context/CartContext";
import { Button, CardMedia, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Head from "next/head";
import Link from "next/link";
import { CartItem } from "@/types/item";

const index = () => {
  const { cartItems, changeQuantityOfItemsInCart } = useCart();

  // カートの中の商品の量を変更
  const handleChangeQuantityOfItemsInCart = (itemId: number, newQuantity: number) => {
    changeQuantityOfItemsInCart(itemId, newQuantity);
  };

  // カートの中の商品の合計金額を求める
  const calculateTotalPrice = (): number => {
    return (
      cartItems.reduce((totalPrice: number, cartItem: CartItem) => {
        return totalPrice + cartItem.attributes.price * cartItem.quantity;
      }, 0)
    );
  };

  return (
    <RootLayout>
      <Head>
        <title>ショッピングカート</title>
      </Head>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold mx-4">
          ショッピングカート
        </h1>

        {/* 上の部分 */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex text-2xl">
            <div>
              合計（{cartItems.length}個の商品）：
            </div>
            <div className="text-pink-700">
              ¥{calculateTotalPrice().toLocaleString()}
            </div>
          </div>
          <div>
            <Button variant="contained" component={Link} href="/checkout" disabled={cartItems.length === 0 && true}>
              決済に進む
            </Button>
          </div>
        </div>

        {/* カートの中の商品 */}
        <div>
          {cartItems.map((cartItem, index) => (
            <div className={"flex py-4 gap-4 border-b-2 " + (index === 0 && "border-t-2")} key={cartItem.id}>
              <div className="ml-4">
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
                    className="w-72 h-72 border"
                  />
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl text-blue-500">
                  <Link
                    href={{
                      pathname: "/item/" + cartItem.attributes.name,
                      query: {itemId: cartItem.id},
                    }}
                  >
                    {cartItem.attributes.name}
                  </Link>
                </h2>
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
                      onChange={(e) => handleChangeQuantityOfItemsInCart(cartItem.id, e.target.value as number)}
                      defaultValue={cartItem.quantity}
                    >
                      <MenuItem key={0} value={0}>0（削除）</MenuItem>
                      {Array.from({ length: 10 }, (_, index) => (
                        <MenuItem key={index + 1} value={index + 1}>
                          {index + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <div className="flex items-center">
                    <DeleteOutlineIcon />
                    <span className="cursor-pointer" onClick={() => handleChangeQuantityOfItemsInCart(cartItem.id, 0)}>
                      削除する
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 下の部分 */}
        {cartItems.length !== 0 && (
          <div className="flex items-center justify-center gap-6">
            <div className="flex text-2xl">
              <div>
                合計（{cartItems.length}個の商品）：
              </div>
              <div className="text-pink-700">
                ¥{calculateTotalPrice().toLocaleString()}
              </div>
            </div>
            <div>
              <Button variant="contained" component={Link} href="/checkout" disabled={cartItems.length === 0 && true}>
                決済に進む
              </Button>
            </div>
          </div>
        )}
      </div>
    </RootLayout>
  );
};

export default index;
