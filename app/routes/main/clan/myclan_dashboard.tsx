import { Dispatch, FC, SetStateAction, useState } from "react";
import { lng } from "~/data/lang";

const _opts:FC<{text:string; value:any}> = ({text, value}) => {
    return <div className="frbc w-full f-backbl s-0-8 f-out f-mc">
        <div className="text-sm lg:text-lg font-semibold">{text}</div>
        <div className="text-sm lg:text-lg font-semibold">{value}</div>
    </div>
}

const MyClanDashboard:FC<{lang:string; clan:IClan; user:IUser; setUser:Dispatch<SetStateAction<IUser>>;}> = ({lang, clan, user, setUser}) => {
    const [isFetching, setIsFetching] = useState<boolean>(false)

    const leaveClan = () => {
        if(user.id == clan.master) return;
        setIsFetching(true)
        fetch(`/leaveClan/id/${user.id}`).then(res => res.json()).then((res:IUser) => {
            setIsFetching(false)
            setUser(res)
        })
    }

    return <div className="fcsc flex-1 h-full f-backl s-0-7 text-white gap-1 lg:gap-2 overflow-x-hidden overflow-y-auto">
        <div className="frsc w-full gap-3 lg:gap-6">
            <img src={clan.icon} className="w-24 h-24 lg:w-48 lg:h-48 rounded-lg" alt="" />
            <div className="fccc text-white w-full text-left gap-1 lg:gap-3">
                <div className="font-bold text-lg lg:text-4xl w-full">{clan.name}</div>
                <div className="font-semibold text-md lg:text-xl w-full">Lv.{clan.level}</div>
                <div className="text-sm lg:text-lg w-full">{clan.exp}/{1000 + clan.level**2*100}</div>
                <div className="border lg:border-2 border-white rounded-full w-full h-2 lg:h-4">
                    <div className="bg-blue-300 h-full rounded-full" style={{width: `${(clan.exp/(1000 + clan.level**2*100))*100}%`}}></div>
                </div>
            </div>
        </div>
        <div className="fccc w-full gap-1 lg:gap-3 mt-1.5 lg:mt-3 text-white">
            <_opts text={lng(lang, "win")} value={clan.win} />
            <_opts text={lng(lang, "lose")} value={clan.lose} />
            <_opts text={lng(lang, "winrate")} value={`${clan.lose == 0 ? 0 : (clan.win / (clan.win + clan.lose) * 100).toFixed(2)}%`} />
            <_opts text={lng(lang, "rating")} value={clan.rate} />
            <_opts text={lng(lang, "clan gold")} value={`${clan.gold}G`} />
            {clan.master == user.id && <button disabled={isFetching} onClick={leaveClan} className="f-btn f-out s-0-7 f-mc w-full text-sm lg:text-lg">{lng(lang, 'leave clan')}</button>}
        </div>
    </div>
}

export default MyClanDashboard;