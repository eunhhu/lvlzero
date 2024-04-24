import { FC, useEffect, useState } from "react";
import { lng } from "~/data/lang";

const states = ["all members", "pending members"]

const MyClanMembers:FC<{lang:string; clan:IClan; user:IUser}> = ({lang, clan, user}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [state, setState] = useState<string>("all members")
    const [members, setMembers] = useState<IUser[]>()
    const [pendings, setPendings] = useState<IUser[]>([])
    const [isFetching, setIsFetching] = useState<boolean>(false)

    useEffect(() => {
        setOnce(true)
    }, [])
    useEffect(() => {
        if(!once) return
        setIsFetching(true)
        fetch(`/getMembers/id/${clan.id}`).then(res => res.json()).then((res:{res:IUser[], pendings:IUser[]}) => {
            setIsFetching(false)
            setMembers(res.res.filter(v => !v.private))
            setPendings(res.pendings.filter(v => !v.private))
        })
    }, [once])

    return <div className="fccc flex-1 h-full f-backl s-0-7 text-white gap-1 lg:gap-2 overflow-hidden">
        <div className="frcc w-full gap-1 lg:gap-2">
            {states.map((sta, i) => {
                const count = sta == "all members" ? members?.length : pendings?.length
                return <div key={i} className={`text-center text-sm lg:text-lg font-bold cursor-pointer w-full f-out f-mc s-0-8 ${sta == state ? "f-back2l" : "f-backl"}`} onClick={e => setState(sta)}>{lng(lang, sta)} ({count})</div>
            })}
        </div>
        <div className="fcsc flex-1 w-full gap-1 lg:gap-2 overflow-x-hidden overflow-y-auto">
            {state == "all members" && members ? members.sort((a, b) => {
                const aRole = clan.master == a.id ? 0 : clan.submasters.includes(a.id) ? 1 : 2
                const bRole = clan.master == b.id ? 0 : clan.submasters.includes(b.id) ? 1 : 2
                return aRole - bRole
            }).map((member, i) => {
                const role = clan.master == member.id ? "master" : clan.submasters.includes(member.id) ? "submaster" : "member"
                return <div key={i} className="w-full frbc p-2 bg-[#ffffff22] hover:bg-[#ffffff33] cursor-pointer rounded-lg text-white">
                    <div className="frsc gap-3">
                        <img src={member.avatar == "default" ? "assets/icons/profile.svg" : member.avatar} alt="" width={50} className="box" />
                        <div className="fcs">
                            <h1 className="text-lg lg:text-xl font-semibold">[{lng(lang, role)}] {member.username}</h1>
                            <h2 className="text-md lg:text-lg font-semibold">Lv.{member.lvl}</h2>
                            <h3 className="text-sm lg:text-md">{member.exp}/{100 + member.lvl**2*10}</h3>
                        </div>
                    </div>
                    <div className="frcc gap-2">
                        {clan.master == user.id && clan.master != member.id && !clan.submasters.includes(member.id) && <button disabled={isFetching} className="f-btn f-out f-mc s-0-6 text-sm lg:text-lg">{lng(lang, "promote")}</button>}
                        {clan.master == user.id && clan.master != member.id && clan.submasters.includes(member.id) && <button disabled={isFetching} className="f-btn f-out f-mc s-0-6 text-sm lg:text-lg">{lng(lang, "demote")}</button>}
                        {clan.master == user.id || (clan.submasters.includes(user.id) && clan.master != member.id && !clan.submasters.includes(member.id)) && <button disabled={isFetching} className="f-btn f-out f-mc s-0-6 text-sm lg:text-lg">{lng(lang, "kick")}</button>}
                    </div>
                </div>
            }) : <></>}
        </div>
    </div>
}

export default MyClanMembers;