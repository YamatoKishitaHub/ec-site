import RootLayout from "@/app/layout";
import { useUser } from "@/context/UserContext";
import { Item, Items } from "@/types/item";
import { PurchaseHistory, PurchaseHistories } from "@/types/purchaseHistory";
import { InfoOutlined } from "@mui/icons-material";
import { FormHelperText, FormLabel, Input } from "@mui/joy";
import { Button, CardMedia, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// 購入履歴を取得
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

    const purchaseHistories = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/purchase-histories', {
      method: 'GET',
      headers,
    })
      .then(checkStatus)
      .then(parseJSON);

    const items = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/items?populate=*', {
      method: 'GET',
      headers,
    })
      .then(checkStatus)
      .then(parseJSON);

    return { props: { purchaseHistories, items  }};
  } catch (error) {
    return { props: { error } };
  }
}) satisfies GetServerSideProps<{
  purchaseHistories?: PurchaseHistories,
  items?: Items,
  error?: any,
}>;

export default function index({
  purchaseHistories, items
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // if (error) {
  //   return <div>An error occured: {error.message}</div>;
  // }

  const router = useRouter();

  const { user, setUser } = useUser();

  // サインインしていなかった場合、サインインしてからリダイレクト
  useEffect(() => {
    if (Object.keys(user).length === 0) {
      router.push({
        pathname: '/auth/signin',
        query: { fromPage: router.pathname }
      });
    }
  }, []);

  const [username, setUsername] = useState<string>(user.username as string);
  const [email, setEmail] = useState<string>(user.email as string);
  const [password, setPassword] = useState<string>('');

  // ユーザー情報を更新
  const handleUpdateUserInformation = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (password.length <= 6) {
      window.alert("パスワードは6文字以上である必要があります。")
    }

    if (window.confirm("ユーザー情報を変更してもよろしいですか？")) {
      fetch(process.env.NEXT_PUBLIC_API_URL + `/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        })
      })
        .then(response => {
          // レスポンスがJSON形式であることを確認
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // 更新成功
          setUser(data);
          router.reload();
          window.alert('ユーザー情報の更新が完了しました。');
        })
        .catch(error => {
          // 更新失敗
          console.error('An error occurred:', error);
        });
    }
  };

  // アカウントを削除
  const handleDeleteUser = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (window.confirm("アカウントを削除してもよろしいですか？")) {
      fetch(process.env.NEXT_PUBLIC_API_URL + `/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          // レスポンスがJSON形式であることを確認
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // 認証成功
          setUser({});
          router.reload();
          window.alert('アカウントの削除が完了しました。');
        })
        .catch(error => {
          // 認証失敗
          console.error('An error occurred:', error);
        });
    }
  };

  const [userId, setUserId] = useState<number>();

  useEffect(() => {
    setUserId(user.id);
  }, [])

  // 全ての購入履歴から、ユーザーの購入履歴のみを抽出し、商品の情報を追加
  const userPurchaseHistories = purchaseHistories.data
    .filter((purchaseHistory: PurchaseHistory) => (
      purchaseHistory.attributes.userId === userId
    ))
    .map((purchaseHistory: PurchaseHistory) => {
      const item = items.data.find((item: Item) => item.id === purchaseHistory.attributes.itemId);
      return {
        ...purchaseHistory,
        item: item,
      };
    });

  return (
    <RootLayout>
      <Head>
        <title>ユーザー情報</title>
      </Head>
      <div className="flex flex-col gap-8">
        {/* ユーザー情報変更 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            ユーザー情報変更
          </h1>
          <form className="flex flex-col w-80 mx-auto gap-2">
            <FormControl>
              <FormLabel>ユーザー名</FormLabel>
              <Input placeholder="" defaultValue={user.username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>メールアドレス</FormLabel>
              <Input placeholder="" defaultValue={user.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>新しいパスワード（6文字以上）</FormLabel>
              <Input placeholder="" defaultValue="" type="password" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
            </FormControl>
            {(password.length > 0 && password.length < 6) && (
              <FormControl error>
                <FormHelperText>
                  <InfoOutlined />
                  パスワードは6文字以上である必要があります。
                </FormHelperText>
              </FormControl>
            )}
            <div className="mx-auto mt-2">
              <Button variant="contained" type="submit" onClick={(e) => handleUpdateUserInformation(e)} disabled={password.length < 6 ? true : false}>
                変更する
              </Button>
            </div>
          </form>
        </div>

        {/* アカウント削除 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            アカウント削除
          </h1>
          <div className="flex flex-col gap-2">
            <div>
              アカウントを復元することはできません。アカウントを削除しますか？
            </div>
            <div>
              <Button variant="contained" color="error" type="submit" onClick={(e) => handleDeleteUser(e)}>
                アカウントを削除する
              </Button>
            </div>
          </div>
        </div>

        {/* 購入履歴 */}
        <div>
          <h1 className="text-3xl mx-4 font-bold text-center">
            購入履歴
          </h1>
          <div>
            {userPurchaseHistories.length === 0 ? (
              <div className="text-center">購入履歴がありません。</div>
            ) : (
              <div className="max-w-2xl mx-auto">
                {userPurchaseHistories.map((purchaseHistory: any, index: number) => (
                  <div key={purchaseHistory.id}>
                    <div className={"flex flex-col gap-2 py-4 border-b-2 " + (index === 0 && "border-t-2")}>
                      {/* 購入日時 */}
                      <div>
                        {new Date(purchaseHistory.attributes.purchaseDatetime).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: false,
                        }).replace("/", "年").replace("/", "月").replace(" ", "日 ").replace(":", "時") + "分"}
                      </div>

                      {/* 商品情報 */}
                      <div className={"flex gap-4"}>
                        <div className="mx-4">
                          <Link
                            href={{
                              pathname: "/item/" + purchaseHistory.item.attributes.name,
                              query: {itemId: purchaseHistory.item.id},
                            }}
                          >
                            <CardMedia
                              component="img"
                              image={process.env.NEXT_PUBLIC_API_URL + purchaseHistory.item.attributes.image.data[0].attributes.url}
                              alt={purchaseHistory.item.attributes.name + "画像0"}
                              className="w-16 h-20 border"
                            />
                          </Link>
                        </div>
                        <div className="flex flex-col gap-2">
                          <h2 className="text-xl text-blue-500">
                            <Link
                              href={{
                                pathname: "/item/" + purchaseHistory.item.attributes.name,
                                query: {itemId: purchaseHistory.item.id},
                              }}
                            >
                              {purchaseHistory.item.attributes.name}
                            </Link>
                          </h2>
                          <div className="flex gap-4">
                            <h3 className="text-xl text-pink-700">
                              ¥{purchaseHistory.item.attributes.price.toLocaleString()}
                            </h3>
                            <div className="flex items-center gap-2">
                              <FormControl size="small">
                                <InputLabel id="quantity-select-label">数量</InputLabel>
                                <Select
                                  labelId="quantity-select-label"
                                  id="quantity-select"
                                  value={purchaseHistory.attributes.quantity}
                                  label="quantity"
                                  defaultValue={purchaseHistory.attributes.quantity}
                                >
                                  <MenuItem key={0} value={purchaseHistory.attributes.quantity}>{purchaseHistory.attributes.quantity}</MenuItem>
                                </Select>
                              </FormControl>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RootLayout>
  );
};
