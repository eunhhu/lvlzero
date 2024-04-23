import {FC, Dispatch, SetStateAction, useEffect, useState} from 'react'
import { Socket } from 'socket.io-client';
import { lng } from '~/data/lang';

const PlayState:FC<{stateHeight:string;lang:string; socket:Socket; setRoom:Dispatch<SetStateAction<IRoom|null>>; user:IUser;}> = ({stateHeight,lang, socket, setRoom, user}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [rooms, setRooms] = useState<IRoom[]>([])
    const [search, setSearch] = useState<string>('')
    const [create, setCreate] = useState<boolean>(false)
    const [roomname, setRoomname] = useState<string>('')
    const [maxUsers, setMaxUsers] = useState<number>(2)
    const [password, setPassword] = useState<string>('')
    const [isPrivate, setIsPrivate] = useState<boolean>(false)
    const [passRoom, setPassRoom] = useState<IRoom|null>(null)
    const [passInput, setPassInput] = useState<string>('')
    const [passError, setPassError] = useState<string>('')
    const [onError, setOnError] = useState<string>('')

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
        if(!socket) return
        socket.emit('getRooms')
        socket.on('getRooms', (list:IRoom[]) => {
            setRooms(list)
        })
        return () => {
            socket.off('getRooms')
        }
    }, [once])

    return <>
        <div className="fccc w-full fixed top-0" style={{height: stateHeight}}>
            <h1 className="text-xl lg:text-4xl text-white font-bold mt-5">{lng(lang, "room list")}</h1>
            <div className="w-full flex flex-row gap-3 p-5">
                <button className="f-btn f-out f-mc s-0-9 text-sm lg:text-lg w-40" onClick={e => setCreate(true)}>{lng(lang, 'create')}</button>
                <div className='f-out f-mc s-0-9 w-full'>
                    <input className="f-inp f-mc s-0-9 text-sm lg:text-lg w-full" type="text" name="" id="" placeholder={lng(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
            </div>
            <div className="w-full h-full overflow-auto flex flex-col gap-1.5 lg:gap-2 items-center p-5">
                {rooms.filter(v => v.name.match(search)).map((room, i) => {
                    return <div key={i} className="f-out f-mc w-full frbc cursor-pointer f-backl s-0-9"
                    onClick={e => {
                        if(room.private){
                            setPassRoom(room)
                            setPassInput('')
                            setPassError('')
                        } else {
                            socket.emit('joinRoom', {ownerId:room.ownerID, user})
                            socket.once('roomJoined', (res:IRoom) => {
                                setRoom(res)
                            })
                        }
                    }}>
                        <div className="flex flex-col justify-center items-start">
                            <div className="text-lg lg:text-xl text-white font-bold flex flex-row justify-center items-center gap-1 lg:gap-2">
                                {room.private && <img src="assets/icons/lock.svg" alt="" className='w-4 lg:w-6' />}
                                {room.name}</div>
                            <div className="text-md lg:text-lg text-white">{room.users.length} / {room.maxUsers}</div>
                        </div>
                        <div className="flex flex-col justify-center items-end">
                            <div className="text-lg lg:text-xl text-white font-bold">{room.ownerName}</div>
                            <div className="text-sm lg:text-lg text-white">{lng(lang, room.status)}</div>
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
                setPassword('')
                setOnError('')
            }}>
                <div className="f-backl s-1 flex flex-col justify-center items-center text-center text-white" style={{width:'80%', height:'70%'}}>
                    <div className="w-full h-full flex flex-col justify-center items-center gap-2 lg:gap-5">
                        <div className="frbc w-[60%]">
                            <div className="text-lg lg:text-3xl font-semibold">{lng(lang, 'room name')}</div>
                            <div className='w-64 f-out f-mc s-0-9'>
                                <input className="f-inp text-sm lg:text-lg w-full font-semibold" type="text" name="" id="" placeholder={lng(lang, 'room name')} value={roomname} onChange={e => {setRoomname(e.target.value);setOnError('')}} />
                            </div>
                        </div>
                        <div className="frbc w-[60%]">
                            <div className="text-lg lg:text-3xl font-semibold">{lng(lang, 'max users')}</div>
                            <div className='f-out f-mc s-0-9 w-32'>
                                <input className="f-inp text-sm lg:text-lg w-full" type="number" name="" id="" placeholder={lng(lang, 'max users')} value={maxUsers}
                                onChange={e => {setMaxUsers(Math.min(Math.max(1, +e.target.value), 4));setOnError('')}} />
                            </div>
                        </div>
                        <div className="frbc w-[60%]">
                            <div className="text-lg lg:text-3xl font-semibold">{lng(lang, 'private')}</div>
                            <input type="checkbox" name="" id="" className="w-7 h-7" checked={isPrivate} onChange={e => {setIsPrivate(e.target.checked);setOnError('')}} />
                        </div>
                        {isPrivate && <div className="frbc w-[60%]">
                            <div className="text-lg lg:text-3xl font-semibold">{lng(lang, 'password')}</div>
                            <div className='w-64 f-out f-mc s-0-9'>
                                <input className="f-inp text-sm lg:text-lg w-full font-semibold" type="password" name="" id="" placeholder={lng(lang, 'password')} value={password} onChange={e => {setPassword(e.target.value);setOnError('')}} />
                            </div>
                        </div>}
                        <div className="text-center text-sm lg:text-lg text-red-500 font-semibold noshadow">{lng(lang, onError)}</div>
                    </div>
                    <button className="f-btn f-out f-mc s-0-7 w-full text-lg lg:text-2xl"
                    onClick={e => {
                        if(!roomname) return setOnError('room name required')
                        if(isPrivate && !password) return setOnError('password required')
                        socket.emit('createRoom', {name:roomname, maxUsers, private:isPrivate, user, password})
                        socket.once('roomCreated', (res:IRoom) => {
                            setCreate(false)
                            setRoomname('')
                            setMaxUsers(2)
                            setIsPrivate(false)
                            setPassword('')
                            setOnError('')
                            setRoom(res)
                        })
                    }}>{lng(lang, 'create')}</button>
                </div>
            </div>}
            {passRoom && <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
            onClick={e => {
                if(e.target != e.currentTarget) return
                setPassRoom(null)
                setPassInput('')
                setPassError('')
            }}>
                <div className="f-backwl s-0-9 flex flex-col justify-center items-center text-center" style={{width:'50%', height:'40%'}}>
                    <div className="w-full h-full flex flex-col justify-center items-center gap-5">
                        <div className="text-lg lg:text-3xl font-semibold">{lng(lang, 'password')}</div>
                        <input className="text-sm lg:text-lg w-64" type="password" name="" id="" placeholder={lng(lang, 'password')} value={passInput} onChange={e => {setPassInput(e.target.value);setPassError('')}}/>
                        <div className="text-sm lg:text-lg text-red-500 font-semibold noshadow">{lng(lang, passError)}</div>
                    </div>
                    <button className="w-full text-lg lg:text-3xl"
                    onClick={e => {
                        if(!passInput) return
                        console.log(passInput == passRoom.password)
                        if(passInput != passRoom.password){
                            setPassError('wrong password')
                            return
                        }
                        socket.emit('joinRoom', {ownerId:passRoom.ownerID, user})
                        socket.once('roomJoined', (res:IRoom) => {
                            setRoom(res)
                        })
                    }}>{lng(lang, 'join')}</button>
                </div>
            </div>}
        </div>
    </>;
}

export default PlayState