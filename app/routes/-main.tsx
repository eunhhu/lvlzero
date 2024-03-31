import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { units } from "~/data/db";
import { lng } from "~/data/lang";
import InRoom from "./main/-inRoom";
import PlayState from "./main/-play";
import UnitsState from "./main/-units";
import SettingsState from "./main/-settings";
import ProfileState from "./main/-profile";
import RankState from "./main/-rank";

const states = ['rank', 'units', 'play', 'profile', 'settings']

const Main:FC<glFCProps> = ({lang, set, user, setUser, socket, setSocket}) => {
    const [state, setState] = useState<string>('play')
    const [room, setRoom] = useState<IRoom|null>(null)

    useEffect(() => {
        if(!user || !socket) return
    }, [user, socket])

    return <div className="cover flex-col" style={{backgroundImage:'url(assets/mainbg.png)'}}>
        {
            room ? <InRoom room={room} setRoom={setRoom} socket={socket} user={user} set={set} /> :
            state == 'play' ? <PlayState lang={lang} socket={socket} setRoom={setRoom} user={user} /> :
            state == 'units' ? <UnitsState lang={lang} user={user} setUser={setUser} /> :
            state == 'settings' ? <SettingsState lang={lang} /> :
            state == 'profile' ? <ProfileState lang={lang} user={user} /> :
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
                <div className="text-xl text-white font-bold">{lng(lang, st)}</div>
            </div>
        })}
    </footer>
}

export default Main