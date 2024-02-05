import RootLayout from "@/app/layout";
import CartPreview from "@/components/cart/CartPreview";
import { useCart } from "@/context/CartContext";
import { Item, Items } from "@/types/item";
import { Button, Card, CardHeader, CardMedia, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

// StrapiのItemsから全ての商品を取得
export const getServerSideProps = (async (context) => {
  try {
    // Parses the JSON returned by a network request
    const parseJSON = (resp: any) => (resp.json ? resp.json() : resp);
    // Checks if a network request came back fine, and throws an error if not
    const checkStatus = (resp: any) => {
      if (resp.status >= 200 && resp.status < 300) {
        return resp;
      }

      return parseJSON(resp).then((resp: string) => {
        throw resp;
      });
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    const items = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/items?populate=*', {
      method: 'GET',
      headers,
    })
      .then(checkStatus)
      .then(parseJSON);

    return { props: { items } };
  } catch (error) {
    return { props: { error } };
  }
}) satisfies GetServerSideProps<{
  items?: Items,
  error?: any,
}>;

export default function item({
  items, error
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // if (error) {
  //   return <div>An error occured: {error.message}</div>;
  // }

  const router = useRouter();

  const itemId: number = Number(router.query.itemId);
  const item: Item = items.data.filter((item: Item) => (item.id === itemId))[0];

  if (!item) {
    return (
      <RootLayout>
        <div>商品の情報を取得できませんでした。</div>
      </RootLayout>
    );
  }

  // ホバーした画像を大きく表示する
  const [mainDisplayImage, setMainDisplayImage] = useState<string>(item.attributes.image.data[0].attributes.url);
  const [mainDisplayImageIndex, setMainDisplayImageIndex] = useState<number>(0);

  const handleChangeImage = (index: number) => {
    setMainDisplayImage(item.attributes.image.data[index].attributes.url);
    setMainDisplayImageIndex(index);
  };

  // カートに入れる量を設定
  const [quantity, setQuantity] = useState<number>(1);

  const handleQuantityChange = (event: SelectChangeEvent<number>) => {
    setQuantity(event.target.value as number);
  };

  const { cartItems, addItemToCart } = useCart();
  
  // カートに商品を追加
  const handleAddItemToCart = () => {
    addItemToCart({...item, quantity});
    router.push('/cart')
  };

  // レコメンドする商品
  const recommendItems = items.data.filter((i: Item) =>
    i.id !== itemId &&
    i.attributes.categories.data.some(category =>
      item.attributes.categories.data.some(c => c.id === category.id)
    )
  );

  return (
    <RootLayout>
      <Head>
        <title>{item.attributes.name}</title>
      </Head>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row mx-4 gap-4">
          {/* 商品画像 */}
          <div className="flex flex-col w-full sm:w-2/3 sm:mx-auto md:w-1/2 lg:w-1/3 gap-2">
            <div>
              <CardMedia
                component="img"
                image={process.env.NEXT_PUBLIC_API_URL + mainDisplayImage}
                alt={item.attributes.name + "画像" + mainDisplayImageIndex}
                className="border"
              />
            </div>
            <div className="flex gap-1">
              {item.attributes.image.data.map((image: any, index: number) => (
                <CardMedia
                  component="img"
                  image={process.env.NEXT_PUBLIC_API_URL + image.attributes.url}
                  alt={item.attributes.name + "画像" + index}
                  key={image.id}
                  className={"w-12 h-16 border " + (mainDisplayImageIndex === index ? "border-blue-400" : "")}
                  onMouseEnter={() => handleChangeImage(index)}
                />
              ))}
            </div>
          </div>

          {/* 商品情報 */}
          <div className="md:w-1/2">
            <h1 className="text-3xl">
              {item.attributes.name}
            </h1>
            <h2 className="text-xl">
              価格：
              <span className="text-pink-700">
                ¥{item.attributes.price.toLocaleString()}
              </span>
            </h2>
            <h3 className="text-xl">
              発売日：{item.attributes.releaseDate.replace("-", "年").replace("-", "月") + "日"}
            </h3>
            <h3 className="text-xl">
              カテゴリー：
              {item.attributes.categories.data.map((category, index: number) => (
                <span key={category.id}>
                  <Link href={"/search/" + category.attributes.english} className="text-blue-500">
                    {(category.attributes.japanese)}
                  </Link>
                  {index !== item.attributes.categories.data.length - 1 && "、"}
                </span>
              ))}
            </h3>
            <p className="text-lg">
              {item.attributes.description}
            </p>
          </div>

          {/* 商品購入 */}
          <div className="flex flex-col w-52 h-52 p-4 gap-5 border">
            <h3 className="text-xl text-pink-700">
              ¥{item.attributes.price.toLocaleString()}
            </h3>
            <div>
              <FormControl fullWidth>
                <InputLabel id="quantity-select-label">数量</InputLabel>
                <Select
                  labelId="quantity-select-label"
                  id="quantity-select"
                  value={quantity}
                  label="quantity"
                  onChange={handleQuantityChange}
                  defaultValue={1}
                >
                  {Array.from({ length: 10 }, (_, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {index + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="text-center">
              <Button variant="contained" onClick={handleAddItemToCart}>
                カートに入れる
              </Button>
            </div>
          </div>
        </div>

        {/* レコメンド商品 */}
        <div className="flex flex-col mx-4 gap-2">
          <h2 className="text-2xl font-bold">
            この商品を見た方におすすめの商品
          </h2>
          {recommendItems.length !== 0 ? (
            <div className="flex gap-2 w-full overflow-x-scroll">
              {recommendItems.map((recommendItem: Item) => (
                <div key={recommendItem.id}>
                  <Link
                    href={{
                      pathname: "/item/" + recommendItem.attributes.name,
                      query: {itemId: recommendItem.id},
                    }}
                    className="inline-block w-52"
                  >
                    <div>
                      <Card variant="outlined">
                        <CardMedia
                          component="img"
                          height="194"
                          image={process.env.NEXT_PUBLIC_API_URL + recommendItem.attributes.image.data[0].attributes.url}
                          alt={recommendItem.attributes.name + "画像0"}
                          className="w-48 h-52 mx-auto"
                        />
                        <CardHeader
                          title={recommendItem.attributes.name}
                          subheader={"¥" + recommendItem.attributes.price.toLocaleString()}
                        />
                      </Card>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div>類似の商品はありません。</div>
          )}
        </div>

        {/* 画面下カートプレビュー */}
        {cartItems.length !== 0 && <CartPreview />}
      </div>
    </RootLayout>
  );
};
