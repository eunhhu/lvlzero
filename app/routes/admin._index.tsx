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
            user?.admin ? <Table /> : <div className="flex flex-col w-full h-full justify-center items-center gap-3">
                <input disabled={isFetching} style={{opacity: isFetching ? "0.5" : "1"}} type="text" name="" id="" value={username} onChange={e => {setUsername(e.target.value);setError('')}} />
                <input disabled={isFetching} style={{opacity: isFetching ? "0.5" : "1"}} type="password" name="" id="" value={password} onChange={e => {setPassword(e.target.value);setError('')}} />
                <p className="text-red-700">{error}</p>
                <button disabled={isFetching} style={{opacity: isFetching ? "0.5" : "1"}} onClick={() => {login();setError('')}}>Login</button>
            </div>
        }
        <div className="box absolute left-0 top-0 p-2 flex flex-col items-center justify-center gap-2">
            <div className="text-white font-semibold">Login as : {user?.username || "guest"}</div>
            {user && <button disabled={isFetching} style={{opacity: isFetching ? "0.5" : "1"}} className="p-1" onClick={e => setUser(undefined)}>Logout</button>}
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
        <div className="w-24 h-full flex flex-col gap-2 justify-center items-center">
            {Object.keys(global).map((v, i) => {
                return <button key={i} disabled={isFetching} style={{opacity: isFetching ? "0.5" : "1"}} className={`w-full p-1 noshadow ${page == v ? "bg-[#ffffff44]" : ""}`} onClick={e => setPage(v)}>{v.toUpperCase()}</button>
            })}
        </div>
        <div className="flex-1 h-full flex flex-col justify-start items-center overflow-y-auto overflow-x-hidden p-2 gap-2" style={{opacity: isFetching ? "0.5" : "1"}}>
            {global.users.map((v, i) => {
                return <details key={i} className="w-full flex flex-col justify-start items-center p-1 bg-[#ffffff22] hover:bg-[#ffffff33] cursor-pointer rounded-md">
                    <summary className="flex flex-row justify-between items-center">
                        <div className="text-xl text-white font-bold">[{v.lvl}] {v.username}</div>
                        <div className="flex flex-row justify-center items-center gap-2">
                            <button disabled={isFetching} className="noshadow p-1" onClick={e => {
                                    setEditKey((v as any)._id)
                            }}>Edit</button>
                            <button disabled={isFetching} className="noshadow p-1" onClick={e => {
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
        </div>
    </main>
    {editKey && <div className="w-full h-full absolute top-0 left-0 bg-[#00000066] flex flex-col justify-center items-center"
    onClick={e => {if(e.target === e.currentTarget) {setEditKey('')}}}>
    </div>}
    </>
}
