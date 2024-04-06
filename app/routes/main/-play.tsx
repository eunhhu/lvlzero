import {FC, Dispatch, SetStateAction, useEffect, useState} from 'react'
import { Socket } from 'socket.io-client';
import { lng } from '~/data/lang';

const PlayState:FC<{lang:string; socket:Socket; setRoom:Dispatch<SetStateAction<IRoom|null>>; user:IUser;}> = ({lang, socket, setRoom, user}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [rooms, setRooms] = useState<IRoom[]>([])
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
        socket.on('getRooms', (list:IRoom[]) => {
            setRooms(list)
        })
        return () => {
            socket.off('getRooms')
        }
    }, [once])

    return <div className="flex flex-col justify-center items-center w-full fixed top-0" style={{height: `calc(100% - 76px)`}}>
        <h1 className="text-xl lg:text-4xl text-white font-bold mt-5">{lng(lang, "room list")}</h1>
        <div className="w-full flex flex-row gap-1 p-5">
            <button className="text-sm lg:text-lg w-40" onClick={e => setCreate(true)}>{lng(lang, 'create')}</button>
            <input className="text-sm lg:text-lg w-full" type="text" name="" id="" placeholder={lng(lang, 'search')} value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="w-full h-full overflow-auto flex flex-col gap-2 items-center p-5">
            {rooms.filter(v => v.name.match(search)).map((room, i) => {
                return !room.private && <div key={i} className="w-full flex flex-row justify-between items-center p-5 bg-[#ffffff22] hover:bg-[#ffffff33] cursor-pointer rounded-md"
                onClick={e => {
                    socket.emit('joinRoom', {ownerId:room.ownerID, user})
                    socket.once('roomJoined', (res:IRoom) => {
                        setRoom(res)
                    })
                }}>
                    <div className="flex flex-col justify-center items-start">
                        <div className="text-lg lg:text-xl text-white font-bold">{room.name}</div>
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
        }}>
            <div className="box bg-[#000000aa] flex flex-col justify-center items-center text-center" style={{width:'80%', height:'70%'}}>
                <div className="w-full h-full flex flex-col justify-center items-center gap-5">
                    <div className="flex justify-center items-center gap-5">
                        <div className="text-lg lg:text-3xl">{lng(lang, 'room name')}</div>
                        <input className="text-sm lg:text-lg w-64" type="text" name="" id="" placeholder={lng(lang, 'room name')} value={roomname} onChange={e => setRoomname(e.target.value)}/>
                    </div>
                    <div className="flex justify-center items-center gap-5">
                        <div className="text-lg lg:text-3xl">{lng(lang, 'max users')}</div>
                        <input className="text-sm lg:text-lg w-20" type="number" name="" id="" placeholder={lng(lang, 'max users')} value={maxUsers}
                        onChange={e => setMaxUsers(Math.min(Math.max(1, +e.target.value), 4))} />
                    </div>
                    <div className="flex justify-center items-center gap-5">
                        <div className="text-lg lg:text-3xl">{lng(lang, 'private')}</div>
                        <input type="checkbox" name="" id="" className="w-7 h-7" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                    </div>
                </div>
                <button className="w-full text-lg lg:text-3xl"
                onClick={e => {
                    socket.emit('createRoom', {name:roomname, maxUsers, private:isPrivate, user})
                    socket.once('roomCreated', (res:IRoom) => {
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

export default PlayState