import { FC, Dispatch, SetStateAction, useState, useEffect } from "react";
import { lng } from "~/data/lang";
import MyClanDashboard from "./myclan_dashboard";
import MyClanMembres from "./myclan_members";
import { Socket } from "socket.io-client";
import MyClanWar from "./myclan_clanwar";
import MyClanShop from "./myclan_shop";
import MyClanSettings from "./myclan_settings";

const states = ["dashboard", "members", "clan war", "shop", "settings"]

const MyClan:FC<{
    lang:string;
    user:IUser;
    clan:IClan|null;
    setClan:Dispatch<SetStateAction<IClan|null>>;
    socket:Socket;
    isFetching:boolean;
    setIsFetching:Dispatch<SetStateAction<boolean>>;
}> = ({lang, user, clan, setClan, socket, isFetching, setIsFetching}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [state, setStater] = useState<string>("dashboard")

    useEffect(() => setOnce(true), [])
    useEffect(() => {
    }, [once])

    return <div className="frcc w-full h-full overflow-hidden gap-1 lg:gap-2">
        <div className="fcsc h-full f-back2l s-0-7 w-36 lg:w-48 text-white font-bold text-center text-md lg:text-xl gap-1 lg:gap-2 overflow-x-hidden overflow-y-auto">
            {states.map((sta, i) => {
                return <div key={i} className={`cursor-pointer w-full f-out f-mc s-0-8 ${sta == state ? "f-back2l" : "f-backl"}`} onClick={e => setStater(sta)}>{lng(lang, sta)}</div>
            })}
        </div>
        {clan && (
            state == "dashboard" ? <MyClanDashboard lang={lang} clan={clan} user={user} socket={socket} isFetching={isFetching} setIsFetching={setIsFetching} /> :
            state == "members" ? <MyClanMembres lang={lang} clan={clan} setClan={setClan} user={user} socket={socket} isFetching={isFetching} setIsFetching={setIsFetching} /> :
            state == "clan war" ? <MyClanWar lang={lang} /> :
            state == "shop" ? <MyClanShop lang={lang} /> :
            state == "settings" ? <MyClanSettings lang={lang} clan={clan} isFetching={isFetching} setIsFetching={setIsFetching} /> : <></>
        )}
    </div>
}

export default MyClan;