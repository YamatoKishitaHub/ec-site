import RootLayout from "@/app/layout";
import { useUser } from "@/context/UserContext";
import { FormControl, FormLabel, Input } from "@mui/joy";
import { Button } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

const register = () => {
  const router = useRouter();

  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { setUser } = useUser();

  // ユーザー新規登録
  const handleRegister = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/local/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
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
        console.log('User profile', data.user);
        console.log('User token', data.jwt);
        setUser(data.user);
        router.push('/');
        window.alert('新規登録が完了しました。');
      })
      .catch(error => {
        // 認証失敗
        console.error('An error occurred:', error);

        window.alert('すでに使用されているメールアドレスです。')
      });
  };

  return (
    <RootLayout>
      <Head>
        <title>ユーザー新規登録</title>
      </Head>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl text-center font-bold">
          ユーザー新規登録
        </h1>
        <form className="flex flex-col w-80 mx-auto gap-2">
          <FormControl>
            <FormLabel>ユーザー名</FormLabel>
            <Input placeholder="" defaultValue="" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>メールアドレス</FormLabel>
            <Input placeholder="" defaultValue="" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>パスワード</FormLabel>
            <Input placeholder="" defaultValue="" type="password" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
          </FormControl>
          <div className="mx-auto mt-2">
            <Button variant="contained" type="submit" onClick={(e) => handleRegister(e)}>
              登録する
            </Button>
          </div>
        </form>
      </div>
    </RootLayout>
  );
};

export default register;
