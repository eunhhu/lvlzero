import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";
import { lng } from "~/data/lang";
import ClanCreation from "./creation";
import ClanExplore from "./explore";
import MyClan from "./myclan";
import { Socket } from "socket.io-client";

const states = ["explore", "my clan"]

const ClanState:FC<{stateHeight:string;lang:string;user:IUser;setUser:Dispatch<SetStateAction<IUser>>;socket:Socket;}> = ({stateHeight, lang, user, setUser, socket}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [clans, setClans] = useState<IClan[]>([]) // all clans
    const [state, setState] = useState<string>("explore") // explore, my clan, creation
    const [clanProf, setClanProf] = useState<IClan|null>(null) // clan profile
    const [owner, setOwner] = useState<IUser|null>(null) // clan profile owner
    const [clan, setClan] = useState<IClan|null>(null) // my clan

    useEffect(() => {setOnce(true)}, [])
    useEffect(() => {
        if(!once) return;
        if(state == "explore") refresh()
    }, [once])

    useEffect(() => {
        if(!once) return;
        socket.on('clanApply', (data:{id:string; uid:string}) => {
            if(data.uid == user.id) {
                setIsFetching(false)
                let cls = clans.map(v => {
                    if(v.id == data.id) {
                        v.pending = [...v.pending, data.uid]
                    }
                    return v
                })
                setClans(cls)
                setClanProf(cls.find(v => v.id == data.id) as IClan)
            }
            if(!clan) return
            if(data.id == clan.id) {
                setIsFetching(false)
                setClan({...clan, pending:[...clan.pending, data.uid]})
            }
        })

        socket.on('kickMember', (data:{id:string; uid:string}) => {
            setIsFetching(false)
            if(data.uid == user.id) {
                setUser({...user, clan:""})
                if(state == "my clan") setState("explore")
                setClan(null)
                refresh()
            } else if(clan && clan.id == data.id) {
                setClan({...clan, members:clan.members.filter(v => v != data.uid), submasters:clan.submasters.filter(v => v != data.uid)})
            }
        })

        socket.on('acceptMember', (data:{id:string; uid:string}) => {
            setIsFetching(false)
            if(data.uid == user.id) {
                setUser({...user, clan:data.id})
                if(state == "creation") setState("my clan")
                setClan(clans.find(v => v.id == data.id) as IClan)
                refresh()
            } else if(clan && clan.id == data.id) {
                setClan({...clan, members:[...clan.members, data.uid], pending:clan.pending.filter(v => v != data.uid)})
            }
        })

        socket.on('rejectMember', (data:{id:string; uid:string}) => {
            setIsFetching(false)
            setClans(clans.map(v => {
                if(v.id == data.id) {
                    v.pending = v.pending.filter(p => p != data.uid)
                }
                return v
            }))
            if(clan && clan.id == data.id) {
                setClan({...clan, pending:clan.pending.filter(v => v != data.uid)})
            }
        })

        socket.on('promoteMember', (data:{id:string; uid:string}) => {
            if(!clan) return;
            if(data.id == clan.id) {
                setIsFetching(false)
                setClan({...clan, submasters:[...clan.submasters, data.uid]})
            }
        })

        socket.on('demoteMember', (data:{id:string; uid:string}) => {
            if(!clan) return;
            if(data.id == clan.id) {
                setIsFetching(false)
                setClan({...clan, submasters:clan.submasters.filter(v => v != data.uid)})
            }
        })

        socket.on('leaveClan', (data:{id:string; uid:string}) => {
            if(data.uid == user.id) {
                setIsFetching(false)
                setUser({...user, clan:""})
                setClan(null)
                if(state == "my clan") setState("explore")
                refresh()
            }
            if(!clan) return;
            if(data.id == clan.id) {
                setIsFetching(false)
                setClan({...clan, members:clan.members.filter(v => v != data.uid), submasters:clan.submasters.filter(v => v != data.uid)})
            }
        })

        return () => {
            socket.off('clanApply')
            socket.off('kickMember')
            socket.off('acceptMember')
            socket.off('rejectMember')
            socket.off('promoteMember')
            socket.off('demoteMember')
            socket.off('leaveClan')
        }
    }, [once, clans, user, clan, state])

    const refresh = (goto:boolean = false) => {
        setIsFetching(true)
        fetch('/getAll/col/clans').then(res => {
            return res.json()
        }).then((res:IClan[]) => {
            setIsFetching(false)
            setClans(res.filter(v => !v.private))
            if(user.clan != "") setClan(res.find(v => v.id == user.clan) as IClan)
            if(goto) setState("my clan")
        })
    }

    const apply = () => {
        if(!clanProf) return
        setIsFetching(true)
        socket.emit('clanApply', {id:clanProf.id, uid:user.id})
    }

    useEffect(() => {
        if(!clanProf) return
        setIsFetching(true)
        fetch(`/getUser/type/id/value/${clanProf?.master}`).then(res => res.json()).then((res:{res:IUser}) => {
            setIsFetching(false)
            setOwner(res.res)
        })
    }, [clanProf])

    return <div className="fccc w-full fixed top-0" style={{height:stateHeight}}>
        <div className='frac w-full gap-3 p-2'>
            {states.map((sta, i) => {
                if(user.clan == "" && sta == "my clan") return null
                return <div key={i} className={`text-white text-center font-bold cursor-pointer f-back f-out f-mc s-0-8 text-sm lg:text-lg flex-1 ${sta == state ? "f-back2" : ""}`} onClick={e => setState(sta)}>{lng(lang, sta)}</div>
            })}
            {user.clan == "" && <div className={`text-white text-center font-bold cursor-pointer f-back f-out f-mc s-0-8 text-sm lg:text-lg ${"creation" == state ? "f-back2" : ""}`} onClick={e => setState("creation")}>+</div>}
        </div>
        <div className='flex-1 fcsc w-full overflow-x-hidden overflow-y-auto p-1 gap-1'>
            {state == "explore" ? <ClanExplore lang={lang} clans={clans} setClanProf={setClanProf} />:
            state == "my clan" && user.clan != "" ? <MyClan lang={lang} user={user} clan={clan} setClan={setClan} socket={socket} isFetching={isFetching} setIsFetching={setIsFetching} />:
            state == "creation" && user.clan == "" ? <ClanCreation lang={lang} user={user} setUser={setUser} refresh={refresh} setClan={setClan} isFetching={isFetching} setIsFetching={setIsFetching} />:<></>
            }
        </div>
        {clanProf && <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
        onClick={e => {
            if(e.target != e.currentTarget) return
            setClanProf(null)
            setOwner(null)
        }}>
            {owner && <div className="f-backl s-0-8 w-80 p-3 lg:p-5 flex flex-col justify-center items-center gap-1.5 lg:gap-3">
                <div className='w-full frbc gap-2 lg:gap-3'>
                    <img src={clanProf.icon} alt="" width={100} className='f-back2l s-0-8' />
                    <div className='flex flex-col w-full text-white'>
                        <h1 className='text-lg lg:text-xl font-semibold'>{clanProf.name} ({owner?.username})</h1>
                        <h2 className='text-md lg:text-lg font-semibold'>Lv.{clanProf.level}</h2>
                        <h3 className='text-sm lg:text-md'>{clanProf.exp}/{1000 + clanProf.level**2*100}</h3>
                    </div>
                </div>
                <div className="f-back2l s-0-8 flex-1 w-full p-1 lg:p-2 font-semibold text-lg fccc gap-3 text-white">
                    <div className='text-sm lg:text-md'>{lng(lang, 'win')} {clanProf.win}</div>
                    <div className='text-sm lg:text-md'>{lng(lang, 'lose')} {clanProf.lose}</div>
                    <div className='text-sm lg:text-md'>{lng(lang, 'winrate')} {clanProf.lose == 0 ? 0 : (clanProf.win / (clanProf.win + clanProf.lose) * 100).toFixed(2)}%</div>
                    <div className='text-sm lg:text-md'>{lng(lang, 'rating')} {clanProf.rate}</div>
                </div>
                {user.clan == "" && (!clans.find(v => v.pending.includes(user.id)) || clans.find(v => v.pending.includes(user.id))?.id == clanProf.id) &&
                <button disabled={isFetching} onClick={e => {
                    if(clanProf.pending.includes(user.id)){
                        socket.emit('rejectMember', {id:clanProf.id, uid:user.id})
                    } else {
                        apply()
                    }
                }} className="w-full f-btn f-out f-mc s-0-7">{lng(lang, clanProf.pending.includes(user.id) ? "pending" : "apply")}</button>}
            </div>}
        </div>}
    </div>
}

export default ClanState