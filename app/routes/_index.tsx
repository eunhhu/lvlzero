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
  const [width, setWidth] = useState<number>(1920)
  const [height, setHeight] = useState<number>(1080)
  const [globalState, setGlobalState] = useState<string>('login')
  const [isMobile, setIsMobile] = useState<boolean>(false)
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

    // check if mobile
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
      setIsMobile(true)
    }
    
    // resize event listener
    const resize = () => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [hydration])

  useEffect(() => {
    if(!socket) return
    socket.on('ban', (message:string) => {
      localStorage.removeItem('userId')
      setGlobalState('login')
      alert(message)
    })
    return () => {
      socket.off('ban')
    }
  }, [socket])

  const onFullscreenButtonClick = async () => {
    try {
      // 전체 화면 모드로 전환
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).mozRequestFullScreen) { // Firefox
        await (document.documentElement as any).mozRequestFullScreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) { // Chrome, Safari and Opera
        await (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).msRequestFullscreen) { // IE/Edge
        await (document.documentElement as any).msRequestFullscreen();
      }
  
      // 화면 방향을 가로로 고정
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape')
      }
    } catch (error) {
      console.error(`Error trying to force fullscreen and lock orientation: ${error}`);
    }
  };

  return (<>
    {hydration && global ? <>{
      height > width ? <main className="w-full h-full bg-black flex flex-col justify-center items-center p-1 gap-2">
        <div className="text-gray-300 font-semibold text-md">Get Fullscreen with mobile device</div>
        <button className="noshadow p-1 border-gray-300 text-gray-300 pl-4 pr-4" onClick={e => {
          onFullscreenButtonClick()
        }}>Catch</button>
      </main> :
      globalState == 'login' ? <Login lang={lang} setLang={setLang} set={setGlobalState} user={user as IUser} setUser={setUser as any} socket={socket as Socket} setSocket={setSocket as any} global={global} isMobile={isMobile} /> :
      globalState == 'main' ? <Main lang={lang} setLang={setLang} set={setGlobalState} user={user as IUser} setUser={setUser as any} socket={socket as Socket} setSocket={setSocket as any} global={global} isMobile={isMobile} />:
      globalState == 'play' ? <Play lang={lang} setLang={setLang} set={setGlobalState} user={user as IUser} setUser={setUser as any} socket={socket as Socket} setSocket={setSocket as any} global={global} isMobile={isMobile} />:
      <>404</>
    }</> : <main className="w-full h-full bg-black flex flex-col justify-end items-end text-gray-300 font-semibold text-sm p-1">Loading . . .</main>}
  </>);
}
