import { MetaFunction } from "@remix-run/node";
import { FC, useEffect, useState } from "react";
import { sha256 } from "~/data/utils";

export const meta: MetaFunction = () => {
    return [
        { title: "LVL.ZERO Admin" },
        { name: "description", content: "Admin Page" },
    ];
};

export default function Index(){
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [user, setUser] = useState<IUser>()

    const login = ():void => {
        if(!username) return setError('enter username')
        if(!password) return setError('enter password')
        if(isFetching) return
        setIsFetching(true)
        fetch(`/getUser/type/username/value/${username}`).then(res => res.json()).then((res:{res:IUser}) => {
            if(res.res){
                if(res.res.password === sha256(password)){
                    setUser(res.res)
                    setUsername('')
                    setPassword('')
                    setIsFetching(false)
                }else{
                    setIsFetching(false)
                    setError('invalid password')
                }
            }else{
                setIsFetching(false)
                setError('invalid username')
            }
        })
    }

    return <main className="bg-black w-full h-full">
        {
            user?.admin ? <Table /> : <div className="fccc w-full h-full items-center gap-3">
                <div className="f-out f-mc s-0-8"><input className="f-inp f-mc s-0-7" disabled={isFetching} type="text" name="" id="" value={username} onChange={e => {setUsername(e.target.value);setError('')}} /></div>
                <div className="f-out f-mc s-0-8"><input className="f-inp f-mc s-0-7" disabled={isFetching} type="password" name="" id="" value={password} onChange={e => {setPassword(e.target.value);setError('')}} /></div>
                <p className="text-red-700">{error}</p>
                <button className="f-btn f-out f-mc s-0-7" disabled={isFetching} onClick={() => {login();setError('')}}>Login</button>
            </div>
        }
        <div className="f-backl s-0-8 absolute left-1 top-1 p-2 fccc gap-2 w-36">
            <div className="text-white font-semibold text-center">Login as : {user?.username || "guest"}</div>
            {user && <button disabled={isFetching} className="f-btn f-out f-mc s-0-7" onClick={e => setUser(undefined)}>Logout</button>}
        </div>
    </main>
}

const Table:FC = () => {
    const [once, setOnce] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [page, setPage] = useState<string>('users')
    const [global, setGlobal] = useState<IDB>()
    const [refresh, setRefresh] = useState<boolean>(false)
    const [editKey, setEditKey] = useState<string>('')
    const [ta, setTa] = useState<string>('')

    useEffect(() => {
        if(!refresh) return
        setIsFetching(true)
        fetch('/getAllDB').then(res => res.json()).then((res:{res:IDB}) => {
            setGlobal(res.res)
            setRefresh(false)
            setIsFetching(false)
        })
    }, [refresh])

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
        setRefresh(true)
    }, [once])

    return global && <><main className="flex flex-row w-full h-full justify-center items-center gap-3 text-white">
        <div className="w-36 h-full flex flex-col gap-2 justify-center items-center">
            {Object.keys(global).map((v, i) => {
                return <button key={i} disabled={isFetching} className={`w-full f-btn f-out f-mc s-0-7 noshadow text-center`} onClick={e => setPage(v)}>{v.toUpperCase()}</button>
            })}
            <button className={`w-full f-backl f-out f-mc s-0-7 noshadow text-center font-bold ${isFetching ? "text-gray-500 cursor-not-allowed" : "text-white"}`} disabled={isFetching} onClick={e => setRefresh(true)}>Refresh</button>
        </div>
        <div className="flex-1 h-full fcsc overflow-y-auto overflow-x-hidden p-2 gap-2" style={{opacity: isFetching ? "0.5" : "1"}}>
            <button disabled={isFetching} className="f-btn f-out f-mc s-0-7 noshadow w-full" onClick={e => {
                setEditKey('modify')
                setTa(JSON.stringify({}))
            }}
            >Modify</button>
            {(global as any)[page].sort((a:any, b:any) => {
                if(page === 'users') return +a.id - +b.id
                if(page === 'units') return a.type < b.type ? -1 : 1
                if(page === 'enemies') return a.type < b.type ? -1 : 1
                if(page === 'levels') return a.level - b.level
                if(page === 'modules') {
                    const aName = a.type.split('-')[0]
                    const bName = b.type.split('-')[0]
                    if(aName < bName) return -1
                    if(aName > bName) return 1
                    return a.quality - b.quality
                }
                if(page === 'clans') return b.level - a.level
            }).map((v:any, i:number) => {
                const title = page === 'users' ? `[${v.lvl}] ${v.admin ? "(Admin)" : ""} ${v.username}`:
                page === 'units' ? `${v.type}`:
                page === 'enemies' ? `${v.type}`:
                page === 'levels' ? `Lv.${v.level}`:
                page === 'modules' ? `${v.type}` :
                page === 'clans' ? `[${v.level}] ${v.name}` : ``
                return <details key={i} className="w-full fcsc p-1 bg-[#ffffff22] hover:bg-[#ffffff33] cursor-pointer rounded-md">
                    <summary className="flex flex-row justify-between items-center">
                        <div className="text-xl text-white font-bold">{title}</div>
                        <div className="flex flex-row justify-center items-center gap-2">
                            <button disabled={isFetching} className="noshadow f-btn f-out f-mc s-0-7" onClick={e => {
                                setEditKey((v as any)._id)
                                let newone = {...v}
                                delete newone._id
                                setTa(JSON.stringify(newone, null, 2))
                            }}>Edit</button>
                            <button disabled={isFetching} className="noshadow f-btn f-out f-mc s-0-7" onClick={e => {
                                setIsFetching(true)
                                fetch(`/deleteOne/col/${page}/id/${(v as any)._id}`).then(res => res.json()).then(res => {
                                    setRefresh(true)
                                    setIsFetching(false)
                                })
                            }}>Delete</button>
                        </div>
                    </summary>
                    {Object.keys(v).map((k, j) => {
                        return <div className="flex flex-row justify-between items-center">
                            <div key={j} className="text-lg text-white">{k} : {JSON.stringify(Object.values(v)[j])}</div>
                        </div>
                    })}
                </details>
            })}
            <button disabled={isFetching} className="f-btn f-out f-mc s-0-7 noshadow w-full" onClick={e => {
                setEditKey('create')
                setTa(JSON.stringify({}))
            }}>Create</button>
        </div>
    </main>
    {editKey && <div className="w-full h-full absolute top-0 left-0 bg-[#00000066] flex flex-col justify-center items-center"
    onClick={e => {if(e.target === e.currentTarget) {setEditKey('');setTa('')}}}>
        <div className="f-backwl s-0-7 w-[80%] h-[80%] p-2 flex flex-col gap-2">
            <textarea disabled={isFetching} className="f-inp w-full h-full f-backbl s-0-7" name="" id="" value={ta} onChange={e => setTa(e.target.value)}></textarea>
            <button disabled={isFetching} className="f-btn f-out f-mc s-0-7" onClick={async e => {
                try{
                    JSON.parse(ta);
                } catch {
                    return;
                }
                setIsFetching(true)
                if(editKey == 'create'){
                    fetch(`/createOne/col/${page}`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: ta
                    }).then(res => res.json()).then(res => {
                        setRefresh(true)
                        setIsFetching(false)
                        setEditKey('')
                        setTa('')
                    })
                } else if(editKey == 'modify') {
                    fetch(`/modify/col/${page}`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: ta
                    }).then(res => res.json()).then(res => {
                        setRefresh(true)
                        setIsFetching(false)
                        setEditKey('')
                        setTa('')
                    })
                } else if(editKey) {
                    fetch(`/updateOne/col/${page}/id/${editKey}`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(JSON.parse(ta))
                    }).then(res => res.json()).then(res => {
                        setRefresh(true)
                        setIsFetching(false)
                        setEditKey('')
                        setTa('')
                    })
                }
            }}>{editKey == 'create' ? "Create" : editKey == 'modify' ? "Modify" : "Save"}</button>
        </div>
    </div>}
    </>
}
