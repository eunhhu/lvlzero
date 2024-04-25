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
    const [clans, setClans] = useState<IClan[]>([])
    const [state, setState] = useState<string>("explore")
    const [clanProf, setClanProf] = useState<IClan>()
    const [owner, setOwner] = useState<IUser>()

    useEffect(() => {setOnce(true)}, [])
    useEffect(() => {
        if(!once) return;
        if(state == "explore") refresh()
        setIsFetching(true)
        fetch(`/getUser/type/id/value/${user.id}`).then(res => res.json()).then((res:{res:IUser}) => {
            setIsFetching(false)
            setUser(res.res)
        })
    }, [once])

    useEffect(() => {
        if(!once) return;
        socket.on('clanApply', (data:{id:string; uid:string}) => {
            setClans(clans.map(v => {
                if(v.id == data.id) {
                    v.pending.push(data.uid)
                }
                return v
            }))
        })

        socket.on('kickMember', (data:{id:string; uid:string}) => {
            if(data.uid == user.id) {
                console.log('kicked')
                if(state == "my clan") setState("explore")
                setUser({...user, clan:""})
                refresh()
            }
        })

        socket.on('acceptMember', (data:{id:string; uid:string}) => {
            if(data.uid == user.id) {
                setUser({...user, clan:data.id})
                if(state == "creation") setState("my clan")
            }
        })

        socket.on('rejectMember', (data:{id:string; uid:string}) => {
            setClans(clans.map(v => {
                if(v.id == data.id) {
                    v.pending = v.pending.filter(p => p != data.uid)
                }
                return v
            }))
        })

        return () => {
            socket.off('clanApply')
            socket.off('kickMember')
            socket.off('acceptMember')
            socket.off('rejectMember')
        }
    }, [once, clans, user])

    const refresh = (goto:boolean = false) => {
        setIsFetching(true)
        fetch('/getAll/col/clans').then(res => {
            return res.json()
        }).then((res:IClan[]) => {
            setIsFetching(false)
            setClans(res.filter(v => !v.private))
            if(goto) setState("my clan")
        })
    }

    const apply = () => {
        if(!clanProf) return
        setIsFetching(true)
        fetch(`/clanApply/id/${clanProf.id}/uid/${user.id}`).then(res => res.json()).then((res:{res:boolean}) => {
            setIsFetching(false)
            if(res.res) {
                setClans(clans.map(v => {
                    if(v.id == clanProf.id) {
                        v.pending.push(user.id)
                    }
                    return v
                }))
                setClanProf(undefined)
                socket.emit('clanApply', {id:clanProf.id, uid:user.id})
            }
        })
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
            state == "my clan" && user.clan != "" ? <MyClan lang={lang} user={user} setUser={setUser} cin={clans.find(v => v.id == user.clan) as IClan} refresh={refresh} setState={setState} socket={socket} />:
            state == "creation" && user.clan == "" ? <ClanCreation lang={lang} user={user} setUser={setUser} setState={setState} refresh={refresh} />:<></>
            }
        </div>
        {clanProf && <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
        onClick={e => {
            if(e.target != e.currentTarget) return
            setClanProf(undefined)
            setOwner(undefined)
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
                <button disabled={isFetching || clanProf.pending.includes(user.id)} onClick={apply} className="w-full f-btn f-out f-mc s-0-7">{lng(lang, clanProf.pending.includes(user.id) ? "pending" : "apply")}</button>}
            </div>}
        </div>}
    </div>
}

export default ClanState