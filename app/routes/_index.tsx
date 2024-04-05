import { MetaFunction } from "@remix-run/node";
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
  const [global, setGlobal] = useState<IDB>()

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

  useEffect(() => {
    if(!hydration) return
    fetch('/getAllDB').then(res => res.json()).then((res:{res:IDB}) => {
      setGlobal({...res.res, users:res.res.users.map((v:IUser) => {return {...v, password:''}})})
    })
  }, [hydration])

  return (<>
    {hydration && global ? <>{
      globalState == 'login' ? <Login lang={lang} set={setGlobalState} user={user as IUser} setUser={setUser as any} socket={socket as Socket} setSocket={setSocket as any} global={global} /> :
      globalState == 'main' ? <Main lang={lang} set={setGlobalState} user={user as IUser} setUser={setUser as any} socket={socket as Socket} setSocket={setSocket as any} global={global} />:
      globalState == 'play' ? <Play lang={lang} set={setGlobalState} user={user as IUser} setUser={setUser as any} socket={socket as Socket} setSocket={setSocket as any} global={global} />:
      <>404</>
    }</> : <main className="w-full h-full bg-black flex flex-col justify-end items-end text-gray-300 font-semibold text-sm p-1">Loading . . .</main>}
  </>);
}
