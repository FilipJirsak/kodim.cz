import {
  createContext, MutableRefObject, useContext, useMemo, useRef,
} from 'react';
import type { KodimCms } from 'kodim-cms';
import type { AccessCheck } from 'kodim-cms/esm/content/access-check.js';
import type { User, Claims } from '../../server/db';

export interface Account {
  user: User;
  claims: Claims;
}

export type Store = Record<string, any>;

function storeData<T>(store: Store, key: string, data: T) {
  // eslint-disable-next-line no-param-reassign
  store[key] = data;
}

function getData<T>(store: Store, key: string): T | undefined {
  return store[key];
}

export interface Logins {
  githubClientId: string;
}

export interface BaseAppContext {
  store: Store,
  storeData: (key: string, data: any) => void,
  retrieveData: (key: string) => any,
  url: string,
  idRef: MutableRefObject<number>,
}

export interface ServerAppContext extends BaseAppContext {
  env: 'server',
  account: Account | null;
  cms: KodimCms,
  accessCheck: AccessCheck,
  logins: Logins,
}

export interface ClientAppContext extends BaseAppContext {
  env: 'client',
}

type AppContext = ServerAppContext | ClientAppContext;

const appContext = createContext<AppContext>({
  env: 'client',
  store: {},
  storeData: () => { },
  retrieveData: () => { },
  url: '/',
  idRef: { current: 0 },
});

export const useAppContext = () => useContext(appContext);

export const useId = (): string => {
  const { idRef } = useAppContext();

  return useMemo((): string => {
    const newId = `id${idRef.current}`;
    idRef.current += 1;
    return newId;
  }, []);
};

export function useData<T>(
  fetcher: (serverContext: ServerAppContext) => T | Promise<T>,
): T {
  const key = useId();
  const context = useAppContext();

  const data = context.retrieveData(key);
  if (data === undefined) {
    if (context.env === 'client') {
      throw Error('bad server data');
    } else {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw Promise.resolve(fetcher(context)).then(
        (resource) => context.storeData(key, resource),
      );
    }
  }

  return data as T;
}

interface ClientProviderProps {
  children: React.ReactNode;
}

export const ClientContextProvider = ({ children }: ClientProviderProps) => {
  // @ts-ignore
  // eslint-disable-next-line no-underscore-dangle
  const store = window.__STORE__ as Store;

  const idRef = useRef(0);

  const value = useMemo((): ClientAppContext => ({
    store,
    env: 'client',
    storeData: (key: string, data: any) => storeData(store, key, data),
    retrieveData: (key: string) => getData(store, key),
    url: `${window.location.pathname}${window.location.search}`,
    idRef,
  }), [store]);

  return (
    <appContext.Provider value={value}>
      {children}
    </appContext.Provider>
  );
};

interface ServerProviderProps {
  account: Account | null,
  cms: KodimCms,
  accessCheck: AccessCheck,
  logins: Logins,
  store: Store;
  children: React.ReactNode;
  url: string
}

export const ServerContextProvider = ({
  account, cms, accessCheck, store, logins, children, url,
}: ServerProviderProps) => {
  const idRef = useRef(0);

  const value = useMemo((): ServerAppContext => ({
    store,
    env: 'server',
    account,
    storeData: (key: string, data: any) => storeData(store, key, data),
    retrieveData: (key: string) => getData(store, key),
    cms,
    accessCheck,
    logins,
    url,
    idRef,
  }), [cms, account, accessCheck, store, logins, url]);

  return (
    <appContext.Provider value={value}>
      {children}
    </appContext.Provider>
  );
};
