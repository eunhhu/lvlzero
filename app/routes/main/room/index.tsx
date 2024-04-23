import {FC, Dispatch, SetStateAction, useEffect, useState, useRef} from 'react'
import { Socket } from 'socket.io-client';
import { lng } from '~/data/lang';

const InRoom:FC<{lang:string; room:IRoom; setRoom:Dispatch<SetStateAction<IRoom|null>>; socket:Socket; user:IUser; set:Dispatch<SetStateAction<string>>;global:IDB}> = ({lang, room, setRoom, socket, user, set, global}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [lvl, setLvl] = useState<number>(0)
    const [tester, setTester] = useState<string>('play')
    const [onChat, setOnChat] = useState<boolean>(false)
    const [chats, setChats] = useState<IChat[]>([])
    const [input, setInput] = useState<string>('')
    const chatRef = useRef<HTMLDivElement>(null)

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
            set(tester)
        })
        socket.on('roomLeveled', (res:number) => {
            if(room.ownerID == socket.id) return
            setLvl(res)
        })
        socket.on('chat', (res:IChat) => {
            setChats([...chats, res])
        })
        socket.on('getLevel', (res:number) => {
            setLvl(res)
        })
        return () => {
            socket.off('userJoined')
            socket.off('userLeft')
            socket.off('roomDeleted')
            socket.off('gameStarted')
            socket.off('roomLeveled')
            socket.off('chat')
            socket.off('getLevel')
        }
    }, [once, tester, chats])

    useEffect(() => {
        if(!once) return
        socket.emit('getLevel', room.ownerID)
    }, [once])

    useEffect(() => {
        // auto scroll
        chatRef.current?.scrollTo(0, chatRef.current.scrollHeight)
    }, [chats, onChat])

    return <>
        <div className="fccc w-full h-full fixed top-0 gap-1.5 lg:gap-2 p-1.5 lg:p-2">
            <div className="w-full p-2 f-backl s-0-5 frbc">
                <div className="text-left text-lg lg:text-2xl font-bold text-white">
                    {room.name} [{room.ownerName}]
                </div>
                <div className="absolute right-3 p-2 text-sm lg:text-md text-center font-bold w-40 f-back2l s-0-5 text-white">{room.users.length} / {room.maxUsers}</div>
            </div>
            <div className="w-full h-full frcc">
                <div className="f-backl s-0-5 h-full flex flex-col p-1 gap-1">
                    {
                        room.users.map((v, i) => {
                            return <div key={i} className="w-40 frbc p-2 f-backl f-out f-mc s-0-8 hover:bg-[#ffffff33] cursor-pointer rounded-md">
                                <div className="text-lg lg:text-xl text-white font-bold">{v.username}</div>
                                <div className="text-md lg:text-lg text-white">Lv.{v.lvl}</div>
                            </div>
                        })
                    }
                </div>
                <div className="w-full h-full fccc">
                    <div className='frcc p-5 gap-3'>
                        {room.ownerID == socket.id && <div className='cursor-pointer text-white p-1 f-back font-semibold f-out f-mc s-0-5' onClick={e => changeLvl(-1)}>&nbsp;&lt;&nbsp;</div>}
                        <h1 className='text-white font-semibold text-lg lg:text-2xl'>{lng(lang, 'level')} {lvl+1} - {lng(lang, global.levels.find(v => v.level == lvl+1)?.title.toUpperCase() || "")}</h1>
                        {room.ownerID == socket.id && <div className='cursor-pointer text-white p-1 f-back font-semibold f-out f-mc s-0-5' onClick={e => changeLvl(1)}>&nbsp;&gt;&nbsp;</div>}
                    </div>
                    <div className="frs gap-2 flex-wrap p-5">
                        {
                            user.equipped.map((v, i) => {
                                const mod = user.equippedModules[i]
                                return <div key={i} className='fccc gap-1 lg:gap-1.5'>
                                    <div className="f-out f-mc f-backwl s-0-5 bg-cover bg-center cursor-pointer w-16 h-16 lg:w-24 lg:h-24"
                                    style={{backgroundImage:`${v ? `url(assets/units/${v == 'l' ? 'locked' : v}.png)` : ''}`}}>
                                        {v == 'l' && <div
                                        className="w-full h-full fccc rounded-md bg-[#00000077] text-white text-md lg:text-xl font-bold">900</div>}
                                    </div>
                                    <div className='frcc gap-1 lg:gap-1.5'>
                                        {mod.map((mod, i) => {
                                            return <div className='flex-1 f-out f-mc f-backwl s-0-5 text-white bg-cover bg-center w-8 lg:w-12 h-8 lg:h-12 cursor-pointer fccc font-bold text-lg lg:text-2xl' style={{
                                                backgroundImage: mod ? `url(assets/modules/${mod.split('-')[0]}.png)` : "none"
                                            }}>{mod && mod.split("-")[1].toUpperCase()}</div>
                                        })}
                                    </div>
                                </div>
                            })
                        }
                    </div>
                    <div className="absolute right-1.5 bottom-1.5 flex flex-col text-center gap-1.5 lg:gap-2">
                        {user.admin && <div className='f-out w-40 f-mc s-0-8'><select className='f-sel f-mc s-0-8 p-2 w-full text-center text-sm lg:text-md' name="" id="" onChange={e => setTester(e.target.value)} value={tester}>
                            <option value="play">2D</option>
                            <option value="play3d">3D</option>
                        </select></div>}
                        {room.ownerID == socket.id && <button className="f-btn f-mc s-0-8 f-out p-2 w-40 text-sm lg:text-md"
                        onClick={e => {
                            setIsFetching(true)
                            socket.emit('startGame', room.ownerID, lvl+1)
                        }}>{lng(lang, 'start')}</button>}
                        <button className="f-btn f-mc s-0-8 f-out p-2 w-40 text-sm lg:text-md"
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
            {!onChat && <div className='absolute right-1'><button className="f-btn f-out f-cm s-0-6 p-2 text-lg lg:text-xl font-semibold"
            onClick={e => setOnChat(true)}>&lt;</button></div>}
            {onChat && <div className="fixed w-full h-full bg-[#00000099] fccc"
            onClick={e => {
                if(e.target != e.currentTarget) return
                setOnChat(false)
            } }>
                <div className="f-backl s-0-9 fccc text-center gap-2" style={{width:'80%', height:'70%'}}>
                    <div className='fcsc flex-1 overflow-y-auto overflow-x-hidden gap-1 w-full p-1' ref={chatRef}>
                        {chats.map((v, i) => {
                            return <div key={i} className='frs gap-1 w-full font-bold'>
                                <div className='text-white text-lg lg:text-2xl'>[{v.username}]</div>
                                <div className='text-white text-lg lg:text-2xl'>{v.message}</div>
                            </div>
                        })}
                    </div>
                    <div className='frs w-full gap-4'>
                        <div className='f-out f-mc s-0-6 w-full'>
                            <input className='f-inp f-mc s-0-6 text-md lg:text-xl p-1 flex-1 w-full' type="text" name="" id="" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => {
                                if(e.key == 'Enter'){
                                    if(input.trim() == '') return
                                    socket.emit('chat', {name:user.username, message:input})
                                    setInput('')
                                }
                            }} />
                        </div>
                        <button className='f-btn f-out f-mc s-0-6 text-md lg:text-xl w-24 lg:w-48' onClick={e => {
                            if(input.trim() == '') return
                            socket.emit('chat', {name:user.username, message:input})
                            setInput('')
                        }}>{lng(lang, 'send')}</button>
                    </div>
                </div>
            </div>}
        </div>
    </>
}

export default InRoom