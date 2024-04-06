import {FC, Dispatch, SetStateAction, useEffect, useState} from 'react'
import { Socket } from 'socket.io-client';
import { lng } from '~/data/lang';

const InRoom:FC<{lang:string; room:IRoom; setRoom:Dispatch<SetStateAction<IRoom|null>>; socket:Socket; user:IUser; set:Dispatch<SetStateAction<string>>;global:IDB}> = ({lang, room, setRoom, socket, user, set, global}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [lvl, setLvl] = useState<number>(0)

    useEffect(() => {
        setOnce(true)
    }, [])

    const changeLvl = (n:number) => {
        if(n < 0 && lvl + n < 0) return;
        if(n > 0 && lvl + n >= global.levels.length) return;
        setLvl(lvl + n);
        socket.emit('levelRoom', room.ownerID, lvl + n)
    }

    useEffect(() => {
        if(!once) return
        socket.on('userJoined', (res:IInRoomUser[]) => {
            setRoom({...room, users:res})
        })
        socket.on('userLeft', (res:IInRoomUser[]) => {
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
        socket.on('roomLeveled', (res:number) => {
            if(room.ownerID == socket.id) return
            setLvl(res)
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
                <div className="text-left text-lg lg:text-2xl font-bold">
                    {room.name} [{room.ownerName}]
                </div>
                <div className="absolute right-0 p-3 text-sm lg:text-md text-center font-bold w-40 box">{room.users.length} / {room.maxUsers}</div>
            </div>
            <div className="w-full h-full flex flex-row justify-center items-center">
                <div className="box h-full flex flex-col p-1 gap-1">
                    {
                        room.users.map((v, i) => {
                            return <div key={i} className="flex w-40 flex-row justify-between items-center p-2 box hover:bg-[#ffffff33] cursor-pointer rounded-md">
                                    <div className="text-lg lg:text-xl text-white font-bold">{v.username}</div>
                                    <div className="text-md lg:text-lg text-white">Lv.{v.lvl}</div>
                            </div>
                        })
                    }
                </div>
                <div className="w-full h-full flex flex-col justify-center items-center">
                    <div className='flex flex-row justify-center items-center p-5 gap-3'>
                        {room.ownerID == socket.id && <button className='p-1 noshadow' onClick={e => changeLvl(-1)}>&nbsp;&lt;&nbsp;</button>}
                        <h1 className='text-white font-semibold text-lg lg:text-2xl'>{lng(lang, 'level')} {lvl+1} - {lng(lang, global.levels.find(v => v.level == lvl+1)?.title.toUpperCase() || "")}</h1>
                        {room.ownerID == socket.id && <button className='p-1 noshadow' onClick={e => changeLvl(1)}>&nbsp;&gt;&nbsp;</button>}
                    </div>
                    <div className="flex flex-row gap-2 flex-wrap p-5">
                        {
                            user.equipped.map((v, i) => {
                                return <div key={i} className="box bg-cover bg-center cursor-pointer"
                                style={{width:'min(15vw,10vh)', height:'min(15vw,10vh)', backgroundImage:`${v ? `url(assets/units/${v == 'l' ? 'locked' : v}.png)` : ''}`}}>
                                    {v == 'l' && <div
                                    className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000077] text-white text-md lg:text-xl font-bold">900</div>}
                                </div>
                            })
                        }
                    </div>
                    <div className="absolute right-0 bottom-0 flex flex-col text-center">
                        {room.ownerID == socket.id && <button className="box p-2 w-40 text-sm lg:text-md"
                        onClick={e => {
                            setIsFetching(true)
                            socket.emit('startGame', room.ownerID, lvl+1)
                        }}>{lng(lang, 'start')}</button>}
                        <button className="box p-2 w-40 text-sm lg:text-md"
                        onClick={e => {
                            setIsFetching(true)
                            socket.emit('leaveRoom', {ownerId:room.ownerID, user})
                            socket.once('roomLeft', () => {
                                setIsFetching(false)
                                setRoom(null)
                            })
                        }}>{lng(lang, 'leave')}</button>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default InRoom