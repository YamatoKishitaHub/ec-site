import { useUser } from '@/context/UserContext';
import { Divider, IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Categories, Category } from '@/types/category';

const Header = () => {
  const router = useRouter();

  // 検索するクエリ文字列
  const [searchQuery, setSearchQuery] = useState('');

  const handleChangeSearchQuery = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // 検索ボックスで検索
  const handleSearch = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (searchQuery) {
      router.push({
        pathname: '/search',
        query: { search: searchQuery },
      });
    }

    // 検索ボックスのフォーカスを外す
    const searchBoxInput = document.activeElement as HTMLInputElement;
    searchBoxInput.blur();
  };
  
  const { user } = useUser();

  // エラー対策でuserではなく、usernameを使う
  const [username, setUsername] = useState<string>('');
  useEffect(() => {
    setUsername(user.username as string);
  }, []);

  const { cartItems } = useCart();

  // エラー対策でcartItems.lengthではなく、cartItemsLengthを使う
  const [cartItemsLength, setCartItemsLength] = useState<number>(0);
  useEffect(() => {
    setCartItemsLength(cartItems.length);
  }, [cartItems]);

  // ハンバーガーメニュー
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // カテゴリー
  const [categories, setCategories] = useState<Categories>();

  useEffect(() => {
    const getCategories = async () => {
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
  
        const categories = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/categories?populate=*', {
          method: 'GET',
          headers,
        })
          .then(checkStatus)
          .then(parseJSON);
  
        setCategories(categories);
      } catch (error) {
        return error;
      }
    };

    getCategories();
  }, []);

  return (
    <>
      <header className="sticky flex flex-col top-0 p-2 md:px-8 h-20 gap-1 bg-gray-800 text-white text-sm z-50">
        <div className="flex justify-between items-center md:text-xl">
          {/* ロゴ */}
          <Link href="/">KISHIYAMA.COM</Link>

          {/* 検索ボックス */}
          <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, height: 40 }}
            className="w-1/2 sm:w-2/5"
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="商品を検索"
              inputProps={{ 'aria-label': 'search items' }}
              defaultValue={router.query.search}
              onChange={(e) => handleChangeSearchQuery(e)}
            />
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" onClick={(e) => handleSearch(e)}>
              <SearchIcon />
            </IconButton>
          </Paper>

          <nav className="sm:flex gap-3 hidden">
            <Link href="/cart">
              カート
              <span className={"inline-block -translate-y-2 rounded-full bg-white text-gray-800 " + (cartItemsLength < 10 ? "px-2" : "px-1")}>
                {cartItemsLength}
              </span>
            </Link>
            <Link href="/user">
              {username ? (username + "さん") : "ゲスト"}
            </Link>
            {username ? (
              <Link href="/auth/signout">サインアウト</Link>
            ) : (
              <Link href="/auth/signin">サインイン</Link>
            )}
          </nav>

          {/* ハンバーガーメニュー */}
          <div className="sm:hidden">
            {isOpen ? (
              <div onClick={() => setIsOpen(false)}>
                <CloseIcon />
              </div>
            ) : (
              <div onClick={() => setIsOpen(true)}>
                <MenuIcon />
              </div>
            )}
          </div>
        </div>

        {/* 商品検索 */}
        <div>
          <nav className="flex gap-3 md:gap-10">
            <Link href="/search/all">
              全て
            </Link>
            {categories?.data.sort((a, b) => (
              a.attributes.english > b.attributes.english ? 1 : -1
            )).map((category: Category) => (
              <Link href={`/search/${category.attributes.english}`} key={category.id}>
                {category.attributes.japanese}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {isOpen && (
        <div className="fixed top-12 right-0 h-full p-4 bg-gray-800 text-white z-50">
          <nav className="flex flex-col gap-3">
            <Link href="/cart">
              カート
              <span className={"inline-block -translate-y-2 rounded-full bg-white text-gray-800 " + (cartItemsLength < 10 ? "px-2" : "px-1")}>
                {cartItemsLength}
              </span>
            </Link>
            <Link href="/user">
              {username ? (username + "さん") : "ゲスト"}
            </Link>
            {username ? (
              <Link href="/auth/signout">サインアウト</Link>
            ) : (
              <Link href="/auth/signin">サインイン</Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
