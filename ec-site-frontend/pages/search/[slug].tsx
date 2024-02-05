import RootLayout from "@/app/layout";
import CartPreview from "@/components/cart/CartPreview";
import { useCart } from "@/context/CartContext";
import { Category, Categories } from "@/types/category";
import { Item, Items } from "@/types/item";
import { Button, Card, CardHeader, CardMedia } from "@mui/material";
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

    const categories = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/categories?populate=*', {
      method: 'GET',
      headers,
    })
      .then(checkStatus)
      .then(parseJSON);

    return { props: { items, categories } };
  } catch (error) {
    return { props: { error } };
  }
}) satisfies GetServerSideProps<{
  items?: Items,
  categories?: Categories,
  error?: any,
}>;

export default function SearchSlug({
  items, categories
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // if (error) {
  //   return <div>An error occured: {error.message}</div>;
  // }

  const router = useRouter();

  const { cartItems } = useCart();

  // カテゴリー（日本語）
  const category = router.query.slug === "all" ? "全て" : categories.data.filter((category: Category) => category.attributes.english === router.query.slug)[0].attributes.japanese;

  // slugとカテゴリーが一致している商品を抽出
  const matchItems = router.query.slug === "all" ? items.data : items.data.filter((item: Item) =>
    item.attributes.categories.data.some((category) => category.attributes.english === router.query.slug)
  );

  // ページネーション
  const numberOfItemsPerPage = 10;
  const numberOfPages = (matchItems.length % numberOfItemsPerPage === 0) ? (matchItems.length / numberOfItemsPerPage) : Math.ceil(matchItems.length / numberOfItemsPerPage);
  const [numberOfCurrentPage, setNumberOfCurrentPage] = useState<number>(1);

  const currentPageItems = matchItems.slice((numberOfCurrentPage - 1) * numberOfItemsPerPage, numberOfCurrentPage * numberOfItemsPerPage);

  return (
    <RootLayout>
      <Head>
        <title>{category}</title>
      </Head>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col mx-4 gap-5">
          <h1 className="text-3xl font-bold">
            {category}
          </h1>

          {/* 商品 */}
          <div className="flex flex-wrap gap-3">
            {currentPageItems.map((item: Item) => (
              <div className="w-72" key={item.id}>
                <Link
                  href={{
                    pathname: "/item/" + item.attributes.name,
                    query: { itemId: item.id },
                  }}
                >
                  <Card variant="outlined">
                    <CardMedia
                      component="img"
                      height="194"
                      image={process.env.NEXT_PUBLIC_API_URL + item.attributes.image.data[0].attributes.url}
                      alt={item.attributes.name + "画像0"}
                      className="w-60 h-64 mx-auto"
                    />
                    <CardHeader
                      title={item.attributes.name}
                      subheader={"¥" + item.attributes.price.toLocaleString()}
                    />
                  </Card>
                </Link>
              </div>
            ))}
          </div>

          {/* ページネーション */}
          <div className="flex gap-2 mx-auto">
            {Array.from({ length: numberOfPages }, (_, index) => (
              <Button variant="outlined" key={index + 1} onClick={() => setNumberOfCurrentPage(index + 1)} disabled={index + 1 === numberOfCurrentPage ? true : false}>
                {index + 1}
              </Button>
            ))}
          </div>
        </div>

        {/* 画面下カートプレビュー */}
        {cartItems.length !== 0 && <CartPreview />}
      </div>
    </RootLayout>
  );
};
