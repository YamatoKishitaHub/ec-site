import RootLayout from "@/app/layout";
import CartPreview from "@/components/cart/CartPreview";
import { useCart } from "@/context/CartContext";
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

    return { props: { items } };
  } catch (error) {
    return { props: { error } };
  }
}) satisfies GetServerSideProps<{
  items?: Items,
  error?: any,
}>;

export default function SearchIndex({
  items, error
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // if (error) {
  //   return <div>An error occured: {error.message}</div>;
  // }

  const router = useRouter();

  const { cartItems } = useCart();

  // クエリ文字列を取得し、半角スペースと全角スペースでわけ、配列にする
  const searchQueries = router.query.search as string;
  const searchQueriesArray: string[] = searchQueries.split(/[ 　]/);

  // 名前か説明文にクエリ文字列の配列のいずれかが含まれている商品を抽出
  const matchItems = items.data.filter((item: Item) => (
    searchQueriesArray.some((searchQuery: string) => (
      item.attributes.name.includes(searchQuery) ||
      item.attributes.description.includes(searchQuery) ||
      item.attributes.categories.data.some(category => category.attributes.english.includes(searchQuery) || category.attributes.japanese.includes(searchQuery))
    ))
  ));

  console.log("11巻".includes(""))

  // ページネーション
  const numberOfItemsPerPage = 10;
  const numberOfPages = (matchItems.length % numberOfItemsPerPage === 0) ? (matchItems.length / numberOfItemsPerPage) : Math.ceil(matchItems.length / numberOfItemsPerPage);
  const [numberOfCurrentPage, setNumberOfCurrentPage] = useState<number>(1);

  const currentPageItems = matchItems.slice((numberOfCurrentPage - 1) * numberOfItemsPerPage, numberOfCurrentPage * numberOfItemsPerPage);

  return (
    <RootLayout>
      <Head>
        <title>
          「{router.query.search}」の検索結果
        </title>
      </Head>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col mx-4 gap-5">
          <h1 className="text-3xl font-bold">
            「{router.query.search}」の検索結果
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
