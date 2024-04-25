import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { lng } from "~/data/lang";

const states = ["all members", "pending members"]

const _MProfile:FC<{lang:string;user:IUser;clan:IClan}> = ({lang, user, clan}) => {
    const role = clan.master == user.id ? "master" : clan.submasters.includes(user.id) ? "submaster" : "member"
    return <div className="frsc gap-3">
        <img src={user.avatar == "default" ? "assets/icons/profile.svg" : user.avatar} alt="" width={50} className="box" />
        <div className="fcs">
            <h1 className="text-lg lg:text-xl font-semibold">({lng(lang, role)}) {user.username}</h1>
            <h2 className="text-md lg:text-lg font-semibold">Lv.{user.lvl}</h2>
            <h3 className="text-sm lg:text-md">{user.exp}/{100 + user.lvl**2*10}</h3>
        </div>
    </div>
}

const MyClanMembers:FC<{lang:string; clan:IClan; setClan:Dispatch<SetStateAction<IClan|undefined>>; user:IUser}> = ({lang, clan, setClan, user}) => {
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
        refresh()
    }, [once])

    const refresh = () => {
        setIsFetching(true)
        fetch(`/getMembers/id/${clan.id}`).then(res => res.json()).then((res:{res:IUser[], pendings:IUser[]}) => {
            setIsFetching(false)
            setMembers(res.res.filter(v => !v.private))
            setPendings(res.pendings.filter(v => !v.private))
        })
    }
    
    const accept = (id:string) => {
        setIsFetching(true)
        fetch(`/acceptMember/id/${clan.id}/uid/${id}`).then(res => res.json()).then((res:{res:IClan}) => {
            setIsFetching(false)
            setClan(res.res)
            refresh()
        })
    }

    const reject = (id:string) => {
        setIsFetching(true)
        fetch(`/rejectMember/id/${clan.id}/uid/${id}`).then(res => res.json()).then((res:{res:IClan}) => {
            setIsFetching(false)
            setClan(res.res)
            refresh()
        })
    }

    const kick = (id:string) => {
        setIsFetching(true)
        fetch(`/kickMember/id/${clan.id}/uid/${id}`).then(res => res.json()).then((res:{res:IClan}) => {
            setIsFetching(false)
            setClan(res.res)
            refresh()
        })
    }

    const promote = (id:string) => {
        setIsFetching(true)
        fetch(`/promoteMember/id/${clan.id}/uid/${id}`).then(res => res.json()).then((res:{res:IClan}) => {
            setIsFetching(false)
            setClan(res.res)
            refresh()
        })
    }

    const demote = (id:string) => {
        setIsFetching(true)
        fetch(`/demoteMember/id/${clan.id}/uid/${id}`).then(res => res.json()).then((res:{res:IClan}) => {
            setIsFetching(false)
            setClan(res.res)
            refresh()
        })
    }

    return <div className="fccc flex-1 h-full f-backl s-0-7 text-white gap-1 lg:gap-2 overflow-hidden">
        <div className="frcc w-full gap-1 lg:gap-2">
            {states.map((sta, i) => {
                const count = sta == "all members" ? members?.length : pendings?.length
                if((clan.master == user.id || clan.submasters.includes(user.id)) && sta == "pending members") return null
                return <div key={i} className={`text-center text-sm lg:text-lg font-bold cursor-pointer w-full f-out f-mc s-0-8 ${sta == state ? "f-back2l" : "f-backl"}`} onClick={e => setState(sta)}>{lng(lang, sta)} ({count})</div>
            })}
        </div>
        <div className="fcsc flex-1 w-full gap-1 lg:gap-2 overflow-x-hidden overflow-y-auto">
            {members && state == "all members" ? members.sort((a, b) => {
                const aRole = clan.master == a.id ? 0 : clan.submasters.includes(a.id) ? 1 : 2
                const bRole = clan.master == b.id ? 0 : clan.submasters.includes(b.id) ? 1 : 2
                return aRole - bRole
            }).map((member, i) => {
                return <div key={i} className="w-full frbc p-2 bg-[#ffffff22] hover:bg-[#ffffff33] cursor-pointer rounded-lg text-white">
                    <_MProfile lang={lang} user={member} clan={clan} />
                    <div className="frcc gap-2">
                        {clan.master == user.id && clan.master != member.id && !clan.submasters.includes(member.id) && <button onClick={e => promote(member.id)} disabled={isFetching} className="f-btn f-out f-mc s-0-6 text-sm lg:text-lg">{lng(lang, "promote")}</button>}
                        {clan.master == user.id && clan.master != member.id && clan.submasters.includes(member.id) && <button onClick={e => demote(member.id)} disabled={isFetching} className="f-btn f-out f-mc s-0-6 text-sm lg:text-lg">{lng(lang, "demote")}</button>}
                        {clan.master != member.id &&
                        ((clan.master == user.id) ||
                        (clan.submasters.includes(user.id) && !clan.submasters.includes(member.id))) &&
                        <button disabled={isFetching} onClick={e => kick(member.id)} className="f-btn f-out f-mc s-0-6 text-sm lg:text-lg">{lng(lang, "kick")}</button>}
                    </div>
                </div>
            }) : pendings && state == "pending members" ? pendings.map((pending, i) => {
                return <div key={i} className="w-full frbc p-2 bg-[#ffffff22] hover:bg-[#ffffff33] cursor-pointer rounded-lg text-white">
                    <_MProfile lang={lang} user={pending} clan={clan} />
                    <div className="frcc gap-2">
                        <button disabled={isFetching} onClick={e => accept(pending.id)} className="f-btn f-out f-mc s-0-6 text-sm lg:text-lg">{lng(lang, "accept")}</button>
                        <button disabled={isFetching} onClick={e => reject(pending.id)} className="f-btn f-out f-mc s-0-6 text-sm lg:text-lg">{lng(lang, "reject")}</button>
                    </div>
                </div>
            }) : <></>}
        </div>
    </div>
}


export default MyClanMembers;