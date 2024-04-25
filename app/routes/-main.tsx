import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { lng } from "~/data/lang";
import InRoom from "./main/room/index";
import PlayState from "./main/play/index";
import ShopState from "./main/shop/index";
import SettingsState from "./main/settings/index";
import ProfileState from "./main/profile/index";
import RankState from "./main/rank/index";
import ClanState from "./main/clan";

const states = ['rank', 'shop', 'play', 'clan', 'profile', 'settings']

const Main:FC<glFCProps> = ({lang, setLang, set, user, setUser, socket, setSocket, global, isMobile}) => {
    const [state, setState] = useState<string>('play')
    const [room, setRoom] = useState<IRoom|null>(null)
    const [stateHeight, setStateHeight] = useState<string>(`calc(100% - ${isMobile ? "74" : "86"}px)`)

    useEffect(() => {
        if(!user || !socket) return
    }, [user, socket])

    return <div className="cover flex-col" style={{backgroundImage:'url(assets/mainbg.png)'}}>
        {
            room ? <InRoom lang={lang} room={room} setRoom={setRoom} socket={socket} user={user} set={set} global={global} /> :
            state == 'play' ? <PlayState stateHeight={stateHeight} lang={lang} socket={socket} setRoom={setRoom} user={user} /> :
            state == 'shop' ? <ShopState stateHeight={stateHeight} lang={lang} user={user} setUser={setUser} global={global}/> :
            state == 'settings' ? <SettingsState stateHeight={stateHeight} lang={lang} setLang={setLang} /> :
            state == 'profile' ? <ProfileState stateHeight={stateHeight} lang={lang} user={user} setUser={setUser as Dispatch<SetStateAction<IUser|null>>} set={set} isMobile={isMobile} /> :
            state == 'rank' ? <RankState stateHeight={stateHeight} lang={lang} /> :
            state == 'clan' ? <ClanState stateHeight={stateHeight} lang={lang} user={user} setUser={setUser} socket={socket}/> :
            <></>
        }
        {!room && <StateOptions state={state} setState={setState} lang={lang} />}
    </div>
}

const StateOptions:FC<{state:string; setState:Dispatch<SetStateAction<string>>; lang:string}> = ({state, setState, lang}) => {
    return <footer className="absolute w-full bottom-0 gap-1 lg:gap-2 frac p-1 lg:p-2">
        {states.map((st, i) => {
            return <div key={i} onClick={e => setState(st)}
                className={`fccc flex-1 items-center cursor-pointer p-2 f-out f-mc s-0-5
                ${state == st ? 'f-back2l' : 'f-backl'}`}>
                <img src={`assets/icons/${st}.svg`} alt={st} width={30} height={30} />
                <div className="text-md lg:text-xl text-white font-bold">{lng(lang, st)}</div>
            </div>
        })}
    </footer>
}

export default Main