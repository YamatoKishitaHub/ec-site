import Head from "next/head";
import { FormControl, FormHelperText, FormLabel, Input } from "@mui/joy";
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { Button } from "@mui/material";
import RootLayout from "@/app/layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/context/UserContext";
import Link from "next/link";

const SignIn = () => {
  const router = useRouter();

  const { user, setUser } = useUser();

  // サインインしている状態でのアクセスを防ぐ
  useEffect(() => {
    if (Object.keys(user).length !== 0) {
      router.push('/');
    }
  }, []);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [signInError, setSignInError] = useState<boolean>(false);

  // サインイン
  const handleSignIn = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/local', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: email,
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
        setSignInError(false);
        setUser(data.user);
        router.push(router.query.fromPage ? router.query.fromPage as string : '/');
      })
      .catch(error => {
        // 認証失敗
        console.error('An error occurred:', error);
        setSignInError(true);
      });
  };

  return (
    <RootLayout>
      <Head>
        <title>サインイン</title>
      </Head>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl text-center font-bold">
          サインイン
        </h1>
        <div className="w-96 mx-auto">
          ユーザーの新規作成もできますが、テストユーザーでログインしたい場合、メールアドレスは「test@test.test」、パスワードは「testtest」とご入力ください。
        </div>
        <form className="flex flex-col w-80 mx-auto gap-2">
          <FormControl error={signInError}>
            <FormLabel>メールアドレス</FormLabel>
            <Input placeholder="" defaultValue="" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl error={signInError}>
            <FormLabel>パスワード</FormLabel>
            <Input placeholder="" defaultValue="" type="password" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
          </FormControl>
          {signInError && (
            <FormControl error>
              <FormHelperText>
                <InfoOutlined />
                メールアドレス、または、パスワードが間違っているようです。
              </FormHelperText>
            </FormControl>
          )}
          <div className="mx-auto mt-2">
            <Button variant="contained" type="submit" onClick={(e) => handleSignIn(e)}>
              サインイン
            </Button>
          </div>
        </form>
        <hr className="w-96 mx-auto" />
        <div className="flex flex-col mx-auto">
          <div>
            アカウントをお持ちではありませんか？
          </div>
          <div className="mx-auto">
            <Button variant="text">
              <Link href="/auth/register">
                新規登録する
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default SignIn;
