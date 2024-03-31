
import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import Login from "./-login";
import Main from "./-main";
import Play from "./-play";
import {Socket} from "socket.io-client";

export const meta: MetaFunction = () => {
  return [
    { title: "LVL.ZERO" },
    { name: "description", content: "Casual Tower Defense Game" },
  ];
};

export default function Index() {
  const [hydration, setHydration] = useState<boolean>(false)
  const [globalState, setGlobalState] = useState<string>('login')
  const [lang, setLang] = useState<string>('en')
  const [user, setUser] = useState<IUser>()
  const [socket, setSocket] = useState<Socket>()

  useEffect(() => {
    setHydration(true)

    let lang = localStorage.getItem('lang')
    if(lang){
      setLang(lang)
    } else {
      localStorage.setItem('lang', navigator.language.split('-')[0])
      setLang(navigator.language.split('-')[0])
    }
  }, [])

  return (<>
    {hydration && <>{
      globalState == 'login' ? <Login lang={lang} set={setGlobalState} user={user as IUser} setUser={setUser as any} socket={socket as Socket} setSocket={setSocket as any} /> :
      globalState == 'main' ? <Main lang={lang} set={setGlobalState} user={user as IUser} setUser={setUser as any} socket={socket as Socket} setSocket={setSocket as any} />:
      globalState == 'play' ? <Play lang={lang} set={setGlobalState} user={user as IUser} setUser={setUser as any} socket={socket as Socket} setSocket={setSocket as any} />:
    <></>
    }</>}
  </>);
}
