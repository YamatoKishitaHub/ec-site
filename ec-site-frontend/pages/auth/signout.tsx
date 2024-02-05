import RootLayout from "@/app/layout";
import { useUser } from "@/context/UserContext";
import { Button } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

const SignOut = () => {
  const router = useRouter();

  const { user, setUser } = useUser();

  // サインインしていない状態でのアクセスを防ぐ
  useEffect(() => {
    if (Object.keys(user).length === 0) {
      router.push('/');
    }
  }, []);

  // サインアウト
  const handleSignOut = (e: React.MouseEvent) => {
    setUser({});
    router.push('/auth/signin');
  };

  return (
    <RootLayout>
      <Head>
        <title>サインアウト</title>
      </Head>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl text-center font-bold">
          サインアウト
        </h1>
        <div className="flex flex-col w-80 mx-auto gap-2">
          <div>
            サインアウトするとカートの情報は削除されます。サインアウトしますか？
          </div>
          <div className="mx-auto">
            <Button variant="contained" type="submit" onClick={(e) => handleSignOut(e)}>
              サインアウト
            </Button>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}

export default SignOut;