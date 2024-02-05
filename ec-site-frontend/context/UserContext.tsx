import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type UserTypes = {
  blocked?: boolean;
  confirmed?: boolean;
  createdAt?: string;
  email?: string;
  id?: number;
  provider?: string;
  updatedAt?: string;
  username?: string;
};

type UserContextProps = {
  user: UserTypes;
  setUser: (newUser: UserTypes) => void;
};

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // セッションストレージのユーザー情報
  const localStorageUser = typeof window !== 'undefined' ?  JSON.parse(localStorage.getItem('user') || '{}') : {};

  // サインインしているときはユーザーの情報、サインアウトしているときは{}を入れる
  const [user, setUser] = useState<UserTypes>(localStorageUser);

  // userが変更されたとき、セッションストレージのuserも変更
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
