import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { units } from "~/data/db";
import { lng } from "~/data/lang";

const states = ['rank', 'units', 'play', 'profile', 'settings']
const outAttrs = ['type', 'buy']

const Main:FC<glFCProps> = ({lang, set, user, setUser, socket, setSocket}) => {
    const [state, setState] = useState<string>('play')
    const [room, setRoom] = useState<Room|null>(null)

    useEffect(() => {
        if(!user || !socket) return
    }, [user, socket])

    return <div className="cover flex-col" style={{backgroundImage:'url(assets/mainbg.png)'}}>
        {
            room ? <InRoom room={room} setRoom={setRoom} socket={socket} user={user} /> :
            state == 'play' ? <PlayState lang={lang} socket={socket} setRoom={setRoom} user={user} /> :
            state == 'units' ? <UnitsState lang={lang} user={user} setUser={setUser} /> :
            state == 'settings' ? <SettingsState lang={lang} /> :
            state == 'profile' ? <ProfileState lang={lang} /> :
            state == 'rank' ? <RankState lang={lang} /> :
            <></>
        }
        <StateOptions state={state} setState={setState} lang={lang} />
    </div>
}

const InRoom:FC<{room:Room; setRoom:Dispatch<SetStateAction<Room|null>>; socket:Socket; user:User}> = ({room, setRoom, socket, user}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
        socket.on('userJoined', (res:InRoomUser[]) => {
            setRoom({...room, users:res})
        })
        socket.on('userLeft', (res:InRoomUser[]) => {
            setRoom({...room, users:res})
        })
        socket.on('roomDeleted', () => {
            setRoom(null)
        })
        return () => {
            socket.off('userJoined')
            socket.off('userLeft')
            socket.off('roomDeleted')
        }
    }, [once])
    
    return <>
        <div className="flex flex-col justify-center items-center w-full fixed top-0" style={{height: `calc(100% - 76px)`}}>
            <div className="w-full flex flex-row gap-2 flex-wrap items-center justify-center overflow-auto p-5" style={{}}>
                {
                    room.users.map((v, i) => {
                        return <div key={i} className="box bg-cover bg-center cursor-pointer"
                        style={{width:'min(15vw,10vh)', height:'min(15vw,10vh)', backgroundImage:`url(assets/units/auto-turret.png)`}}>
                            <div className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000077] text-white text-xl font-bold">Auto Turret</div>
                        </div>
                    })
                }
            </div>
            <div className="absolute bottom-0 flex flex-row gap-2">
                {
                    room.users.map((v, i) => {
                        return <div key={i} className="box bg-cover bg-center cursor-pointer"
                        style={{width:'min(15vw,10vh)', height:'min(15vw,10vh)', backgroundImage:`url(assets/units/auto-turret.png)`}}>
                        </div>
                    })
                }
            </div>
            <div className="absolute right-0 top-0 box p-2 w-40 text-right">{room.users.length} / {room.maxUsers}</div>
            <div className="absolute right-0 bottom-0 box p-2 w-40 text-right">{room.ownerName}</div>
            <button className="box p-2 w-40 text-right"
            onClick={e => {
                setIsFetching(true)
                socket.emit('leaveRoom', {ownerId:room.ownerID, user})
                socket.once('roomLeft', () => {
                    setIsFetching(false)
                    setRoom(null)
                })
            }}>Leave</button>
            <button className="box p-2 w-40 text-right"
            onClick={e => {
                setIsFetching(true)
                socket.emit('startGame')
                socket.once('gameStarted', () => {
                    setIsFetching(false)
                    setRoom(null)
                })
            }}>Start</button>
        </div>
    </>
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

const PlayState:FC<{lang:string; socket:Socket; setRoom:Dispatch<SetStateAction<Room|null>>; user:User;}> = ({lang, socket, setRoom, user}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [rooms, setRooms] = useState<Room[]>([])
    const [search, setSearch] = useState<string>('')
    const [create, setCreate] = useState<boolean>(false)
    const [roomname, setRoomname] = useState<string>('')
    const [maxUsers, setMaxUsers] = useState<number>(2)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [isPrivate, setIsPrivate] = useState<boolean>(false)

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
        if(!socket) return
        socket.emit('getRooms')
        socket.once('getRooms', (list:Room[]) => {
            setRooms(list)
        })
    }, [once])

    return <div className="flex flex-col justify-center items-center w-full fixed top-0" style={{height: `calc(100% - 76px)`}}>
        <h1 className="text-4xl text-white font-bold mt-5">Room List</h1>
        <div className="w-full flex flex-row gap-1 p-5">
            <button className="w-40" onClick={e => setCreate(true)}>{lng(lang, 'create')}</button>
            <input className="w-full" type="text" name="" id="" placeholder={lng(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="w-full h-full overflow-auto flex flex-col gap-2 items-center p-5">
            {rooms.filter(v => v.name.match(search)).map((room, i) => {
                return !room.private && <div key={i} className="w-full flex flex-row justify-between items-center p-5 bg-[#ffffff22] hover:bg-[#ffffff33] cursor-pointer rounded-md"
                onClick={e => {
                    socket.emit('joinRoom', {ownerId:room.ownerID, user})
                    socket.once('roomJoined', (res:Room) => {
                        setRoom(res)
                    })
                }}>
                    <div className="flex flex-col justify-center items-start">
                        <div className="text-xl text-white font-bold">{room.name}</div>
                        <div className="text-lg text-white">{room.users.length} / {room.maxUsers}</div>
                    </div>
                    <div className="flex flex-col justify-center items-end">
                        <div className="text-xl text-white font-bold">{room.ownerName}</div>
                        <div className="text-lg text-white">{lng(lang, room.status)}</div>
                    </div>
                </div>
            })}
        </div>
        {create && <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
        onClick={e => {
            if(e.target != e.currentTarget) return
            setCreate(false)
            setRoomname('')
            setMaxUsers(2)
            setIsPrivate(false)
        }}>
            <div className="box bg-[#000000aa] flex flex-col justify-center items-center text-center" style={{width:'80%', height:'70%'}}>
                <div className="w-full h-full flex flex-col justify-center items-center gap-5">
                    <div className="flex justify-center items-center gap-5">
                        <div className="text-3xl">{lng(lang, 'room name')}</div>
                        <input className="w-40" type="text" name="" id="" placeholder={lng(lang, 'room name')} value={roomname} onChange={e => setRoomname(e.target.value)}/>
                    </div>
                    <div className="flex justify-center items-center gap-5">
                        <div className="text-3xl">{lng(lang, 'max users')}</div>
                        <input className="w-20" type="number" name="" id="" placeholder={lng(lang, 'max users')} value={maxUsers}
                        onChange={e => setMaxUsers(Math.min(Math.max(1, +e.target.value), 4))} />
                    </div>
                    <div className="flex justify-center items-center gap-5">
                        <div className="text-3xl">{lng(lang, 'private')}</div>
                        <input type="checkbox" name="" id="" className="w-7 h-7" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                    </div>
                </div>
                <button className="w-full text-3xl"
                onClick={e => {
                    socket.emit('createRoom', {name:roomname, maxUsers, private:isPrivate, user})
                    socket.once('roomCreated', (res:Room) => {
                        setCreate(false)
                        setRoomname('')
                        setMaxUsers(2)
                        setIsPrivate(false)
                        setRoom(res)
                    })
                }}>{lng(lang, 'create')}</button>
            </div>
        </div>}
    </div>
}

const UnitsState:FC<{lang:string;user:User;setUser:Dispatch<SetStateAction<User>>}> = ({lang, user, setUser}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [selected, setSelected] = useState<string>('')
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
        // here
    }, [once])
    return <div className="flex flex-col justify-center items-center w-full fixed top-0" style={{height: `calc(100% - 76px)`}}>
        <div className="w-full flex flex-row gap-2 flex-wrap items-center justify-center overflow-auto p-5" style={{}}>
            {
                units.map((v, i) => {
                    return <div key={i} className="box bg-cover bg-center cursor-pointer"
                    style={{width:'min(15vw,10vh)', height:'min(15vw,10vh)', backgroundImage:`url(assets/units/${v.type}.png)`}}
                    onClick={e => setSelected(v.type)}>
                        {!user.unlocked.includes(v.type) && <div
                        className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000077] text-white text-xl font-bold">{v.buy}</div>}
                    </div>
                })
            }
        </div>
        <div className="absolute bottom-0 flex flex-row gap-2">
            {
                user.equipped.map((v, i) => {
                    return <div key={i} className="box bg-cover bg-center cursor-pointer"
                    style={{width:'min(15vw,10vh)', height:'min(15vw,10vh)', backgroundImage:`${v ? `url(assets/units/${v == 'l' ? 'locked' : v}.png)` : ''}`}}
                    onClick={e => setSelected(v)}>
                        {v == 'l' && <div
                        className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000077] text-white text-xl font-bold">900</div>}
                    </div>
                })
            }
        </div>
        <div className="absolute right-0 top-0 box p-2 w-40 text-right">{user.gold}G</div>
        {selected && <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
        onClick={e => {
            if(e.target != e.currentTarget) return
            setError('')
            setSelected('')
        }}>
            <div className="box bg-[#000000aa] flex flex-col" style={{width:'80%', height:'70%'}}>
                <div className="w-full h-full flex flex-col justify-center items-center">
                    <div className="text-4xl text-white font-bold w-full text-center p-5">{lng(lang, selected)}</div>
                    {selected == 'l' ? <></> : Object.keys(units.find(v => v.type == selected) as {[key:string]:any}).map((v, i) => {
                        if(outAttrs.includes(v)) return <></>
                        return <div key={i} className="flex flex-row justify-around items-center w-full p-2 text-center">
                            <div className="flex-1 text-2xl text-white font-bold">{lng(lang, v)}</div>
                            <div className="flex-1 text-2xl text-white font-bold">{(units.find(v => v.type == selected) as {[key:string]:any})[v]}</div>
                        </div>
                    })}
                    {selected !== 'l' && [''].map((v, i) => {
                        let th = (units.find(v => v.type == selected) as {[key:string]:any})
                        let dps = Math.round(th.damage / th.rate)
                        return <div key={i} className="flex flex-row justify-around items-center w-full p-2 text-center">
                            <div className="flex-1 text-2xl text-white font-bold">{lng(lang, 'dps')}</div>
                            <div className="flex-1 text-2xl text-white font-bold">{dps}</div>
                        </div>
                    })}
                    {error && <div className="text-red-500 font-bold text-xl noshadow">{lng(lang, error)}</div>}
                </div>
                <button className="text-xl"
                onClick={e => {
                    setError('')
                    const success = (res:User) => {
                        setIsFetching(false)
                        setError('')
                        setSelected('')
                        setUser(res)
                    }
                    if(selected == 'l'){
                        if(user.gold < 900) return setError('not enough gold')
                        // unlock
                        setIsFetching(true)
                        fetch(`/updateUser/id/${user.id}/unlock/slot/gold/900`).then(res => res.json()).then((res:{res:User}) => {
                            if(!res.res) return setError('something went wrong')
                            success(res.res)
                        })
                    } else if(user.equipped.includes(selected)){
                        // unequip
                        setIsFetching(true)
                        fetch(`/updateUser/id/${user.id}/equip/${selected}`).then(res => res.json()).then((res:{res:User}) => {
                            if(!res.res) return setError('something went wrong')
                            success(res.res)
                        })
                    } else if(user.unlocked.includes(selected)){
                        if(user.equipped.indexOf('') == -1) return setError('no empty slot')
                        // equip
                        setIsFetching(true)
                        fetch(`/updateUser/id/${user.id}/equip/${selected}`).then(res => res.json()).then((res:{res:User}) => {
                            if(!res.res) return setError('something went wrong')
                            success(res.res)
                        })
                    } else {
                        const cost = (units.find(v => v.type == selected) as {[key:string]:any}).buy
                        if(user.gold < cost) return setError('not enough gold')
                        // buy
                        setIsFetching(true)
                        fetch(`/updateUser/id/${user.id}/unlock/${selected}/gold/${cost}`).then(res => res.json()).then((res:{res:User}) => {
                            if(!res.res) return setError('something went wrong')
                            success(res.res)
                        })
                    }
                }}>{
                    selected == 'l' ? `${lng(lang, 'buy')} - 900` : user.equipped.includes(selected) ? lng(lang, 'unequip') :
                    user.unlocked.includes(selected) ? lng(lang, 'equip') :
                    `${lng(lang, 'buy')} - ${units.find(v => v.type == selected)?.buy}`
                }</button>
            </div>
        </div>}
    </div>
}

const SettingsState:FC<{lang:string}> = ({lang}) => {
    return <div className="flex flex-col justify-center items-center">
        <div className="text-7xl font-bold text-white">Settings</div>
        <div className="text-3xl font-bold text-white">Coming Soon</div>
    </div>
}

const ProfileState:FC<{lang:string}> = ({lang}) => {
    return <div className="flex flex-col justify-center items-center">
        <div className="text-7xl font-bold text-white">Profile</div>
        <div className="text-3xl font-bold text-white">Coming Soon</div>
    </div>
}

const RankState:FC<{lang:string}> = ({lang}) => {
    return <div className="flex flex-col justify-center items-center">
        <div className="text-7xl font-bold text-white">Rank</div>
        <div className="text-3xl font-bold text-white">Coming Soon</div>
    </div>
}

export default Main