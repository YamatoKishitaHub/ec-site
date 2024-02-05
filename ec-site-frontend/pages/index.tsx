import RootLayout from "@/app/layout";
import Head from "next/head";
import Link from "next/link";

const index = () => {
  return (
    <RootLayout>
      <Head>
        <title>KISHIYAMA.COM</title>
      </Head>
      <div className="mx-4 text-center">
        <div>
          KISHIYAMA.COMへようこそ！
        </div>
        <div>
          Next.js, TypeScript, Strapi, Stripeを用いて開発したECサイトです。
        </div>
        <div>
          ソースコードはこちらの
          <Link href="https://github.com/YamatoKishitaHub/ec-site" className="text-blue-500">
            GitHubページ
          </Link>
          からご覧いただけます。
        </div>
      </div>
    </RootLayout>
  );
};

export default index;
