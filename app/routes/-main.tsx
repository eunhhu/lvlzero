import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { lng } from "~/data/lang";
import InRoom from "./main/room/index";
import PlayState from "./main/play/index";
import ShopState from "./main/shop/index";
import SettingsState from "./main/settings/index";
import ProfileState from "./main/profile/index";
import RankState from "./main/rank/index";

const states = ['rank', 'shop', 'play', 'profile', 'settings']

const Main:FC<glFCProps> = ({lang, setLang, set, user, setUser, socket, setSocket, global, isMobile}) => {
    const [state, setState] = useState<string>('play')
    const [room, setRoom] = useState<IRoom|null>(null)

    useEffect(() => {
        if(!user || !socket) return
    }, [user, socket])

    return <div className="cover flex-col" style={{backgroundImage:'url(assets/mainbg.png)'}}>
        {
            room ? <InRoom lang={lang} room={room} setRoom={setRoom} socket={socket} user={user} set={set} global={global} /> :
            state == 'play' ? <PlayState lang={lang} socket={socket} setRoom={setRoom} user={user} /> :
            state == 'shop' ? <ShopState lang={lang} user={user} setUser={setUser} global={global}/> :
            state == 'settings' ? <SettingsState lang={lang} setLang={setLang} /> :
            state == 'profile' ? <ProfileState lang={lang} user={user} setUser={setUser as Dispatch<SetStateAction<IUser|null>>} set={set} isMobile={isMobile} /> :
            state == 'rank' ? <RankState lang={lang} /> :
            <></>
        }
        {!room && <StateOptions state={state} setState={setState} lang={lang} />}
    </div>
}

const StateOptions:FC<{state:string; setState:Dispatch<SetStateAction<string>>; lang:string}> = ({state, setState, lang}) => {
    return <footer className="absolute w-full bottom-0 bg-[#ffffff22] flex flex-row justify-around items-center">
        {states.map((st, i) => {
            return <div key={i} onClick={e => setState(st)}
                className={`flex flex-col justify-center flex-1 items-center cursor-pointer p-2 hover:bg-[#ffffff11] shadow-inner shadow-white
                ${state == st ? 'bg-[#ffffff33] hover:bg-[#ffffff44]' : ''}`}>
                <img src={`assets/icons/${st}.svg`} alt={st} width={30} height={30} />
                <div className="text-md lg:text-xl text-white font-bold">{lng(lang, st)}</div>
            </div>
        })}
    </footer>
}

export default Main