import {FC, Dispatch, SetStateAction, useEffect, useState} from 'react'
import { Socket } from 'socket.io-client';

const InRoom:FC<{room:Room; setRoom:Dispatch<SetStateAction<Room|null>>; socket:Socket; user:User; set:Dispatch<SetStateAction<string>>}> = ({room, setRoom, socket, user, set}) => {
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
        socket.on('gameStarted', () => {
            setIsFetching(false)
            setRoom(null)
            set('play')
        })
        return () => {
            socket.off('userJoined')
            socket.off('userLeft')
            socket.off('roomDeleted')
            socket.off('gameStarted')
        }
    }, [once])

    return <>
        <div className="flex flex-col justify-center items-center w-full h-full fixed top-0">
            <div className="w-full p-2 box flex flex-row justify-between items-center">
                <div className="text-left text-2xl font-bold">
                    {room.name} [{room.ownerName}]
                </div>
                <div className="absolute right-0 p-3 text-md text-center font-bold w-40 box">{room.users.length} / {room.maxUsers}</div>
            </div>
            <div className="w-full h-full flex flex-row justify-center items-center">
                <div className="box h-full flex flex-col p-1 gap-1">
                    {
                        room.users.map((v, i) => {
                            return <div key={i} className="flex w-40 flex-row justify-between items-center p-2 box hover:bg-[#ffffff33] cursor-pointer rounded-md">
                                    <div className="text-xl text-white font-bold">{v.username}</div>
                                    <div className="text-lg text-white">Lv.{v.lvl}</div>
                            </div>
                        })
                    }
                </div>
                <div className="w-full h-full flex justify-center items-center">
                    <div className="flex flex-row gap-2 flex-wrap p-5">
                        {
                            user.equipped.map((v, i) => {
                                return <div key={i} className="box bg-cover bg-center cursor-pointer"
                                style={{width:'min(15vw,10vh)', height:'min(15vw,10vh)', backgroundImage:`${v ? `url(assets/units/${v == 'l' ? 'locked' : v}.png)` : ''}`}}>
                                    {v == 'l' && <div
                                    className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000077] text-white text-xl font-bold">900</div>}
                                </div>
                            })
                        }
                    </div>
                    <div className="absolute right-0 bottom-0 flex flex-col text-center">
                        {room.ownerID == socket.id && <button className="box p-2 w-40"
                        onClick={e => {
                            setIsFetching(true)
                            socket.emit('startGame', room.ownerID)
                        }}>Start</button>}
                        <button className="box p-2 w-40"
                        onClick={e => {
                            setIsFetching(true)
                            socket.emit('leaveRoom', {ownerId:room.ownerID, user})
                            socket.once('roomLeft', () => {
                                setIsFetching(false)
                                setRoom(null)
                            })
                        }}>Leave</button>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default InRoom