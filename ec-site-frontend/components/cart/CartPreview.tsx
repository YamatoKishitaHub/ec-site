import { Button, CardMedia, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { CartItem } from "@/types/item";

const CartPreview = () => {
  const { cartItems, changeQuantityOfItemsInCart } = useCart();

  // カートの中の商品の合計金額を求める
  const calculateTotalPrice = () => {
    return (
      cartItems.reduce((totalPrice: number, cartItem: CartItem) => {
        return totalPrice + cartItem.attributes.price * cartItem.quantity;
      }, 0)
    );
  };

  // カートの中の商品の量を変更
  const handleChangeQuantityOfItemsInCart = (itemId: number, newQuantity: number) => {
    changeQuantityOfItemsInCart(itemId, newQuantity);
  };

  return (
    <div className="flex items-center gap-4 translate-y-6 border-t-2 bg-gray-100">
      <div className="mx-4">
        <div>
          合計
        </div>
        <div className="text-pink-700">
          ¥{calculateTotalPrice().toLocaleString()}
        </div>
      </div>
      <div>
        <Link href="/cart">
          <Button variant="contained" size="small">
            カートに移動
          </Button>
        </Link>
      </div>
      <div className="flex border-l-2 overflow-x-scroll">
        {cartItems.map((cartItem) => (
          <div className="flex p-2 gap-1 border-r-2" key={cartItem.id}>
            <div className="w-16 text-center">
              <Link
                href={{
                  pathname: "/item/" + cartItem.attributes.name,
                  query: {item: JSON.stringify(cartItem)},
                }}
                key={cartItem.id}
              >
                <CardMedia
                  component="img"
                  image={process.env.NEXT_PUBLIC_API_URL + cartItem.attributes.image.data[0].attributes.url}
                  alt={cartItem.attributes.name + "画像0"}
                  className="w-16 h-20 border"
                />
              </Link>
              <div className="text-pink-700">
                ¥{cartItem.attributes.price.toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col my-auto gap-2">
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
              <DeleteOutlineIcon onClick={() => handleChangeQuantityOfItemsInCart(cartItem.id, 0)} className="mx-auto cursor-pointer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartPreview;
