import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";
import { lng } from "~/data/lang";
import { checkNick } from "~/data/utils";

const states = ["explore", "my clan"]

const ClanState:FC<{stateHeight:string;lang:string;user:IUser;setUser:Dispatch<SetStateAction<IUser>>}> = ({stateHeight, lang, user, setUser}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [clans, setClans] = useState<IClan[]>([])
    const [state, setState] = useState<string>("explore")
    const [clanProf, setClanProf] = useState<IClan>()
    const [error, setError] = useState<string>("")
    const [input, setInput] = useState<string>("")
    const [icon, setIcon] = useState<string>("")
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {setOnce(true)}, [])
    useEffect(() => {
        if(!once) return;
        setIsFetching(true)
        fetch('/getAll/col/clans').then(res => res.json()).then((res:{res:IClan[]}) => {
            setIsFetching(false)
            setClans(res.res.filter(v => !v.private))
        })
    }, [once])

    return <div className="fccc w-full fixed top-0" style={{height:stateHeight}}>
        <div className='frac w-full gap-3 p-2'>
            {states.map((sta, i) => {
                if(user.clan == "" && sta == "my clan") return null
                return <div key={i} className={`text-white text-center font-semibold cursor-pointer f-back f-out f-mc s-0-8 text-sm lg:text-lg flex-1 ${sta == state ? "f-back2" : ""}`} onClick={e => setState(sta)}>{lng(lang, sta)}</div>
            })}
            <div className={`text-white text-center font-semibold cursor-pointer f-back f-out f-mc s-0-8 text-sm lg:text-lg ${"creation" == state ? "f-back2" : ""}`} onClick={e => setState("creation")}>+</div>
        </div>
        <div className='flex-1 fcsc w-full overflow-x-hidden overflow-y-auto p-1 gap-1'>
            {state == "explore" ? clans.map((v, i) => {
                return <div key={i} className='w-full flex flex-row justify-between items-center p-2 bg-[#ffffff22] hover:bg-[#ffffff33] cursor-pointer rounded-md text-white'
                onClick={e => setClanProf(v)}>
                    <div className='flex flex-row justify-start items-center gap-3'>
                        <img src={v.icon == "default" ? "assets/icons/profile.svg" : v.icon} alt="" width={50} className='box' />
                        <div className='flex flex-col'>
                            <h1 className='text-lg lg:text-xl font-semibold'>{i+1}. {v.name}</h1>
                            <h2 className='text-md lg:text-lg font-semibold'>Lv.{v.level}</h2>
                            <h3 className='text-sm lg:text-md'>{v.exp}/{1000 + v.level**2*100}</h3>
                        </div>
                    </div>
                    <div className='flex flex-col justify-center items-end gap-2'>
                        <div className='text-sm lg:text-md'>{lng(lang, 'win')} {v.win}</div>
                        <div className='text-sm lg:text-md'>{lng(lang, 'lose')} {v.lose}</div>
                        <div className='text-sm lg:text-md'>{lng(lang, 'winrate')} {v.lose == 0 ? 0 : (v.win / (v.win + v.lose) * 100).toFixed(2)}%</div>
                        <div className='text-sm lg:text-md'>{lng(lang, 'rating')} {v.rate}</div>
                    </div>
                </div>
            }):
            state == "my clan" ? <></>:
            state == "creation" ? <div className='flex-1 fcac w-full pl-12 pr-12 lg:pl-24 lg:pr-24 gap-1 lg:gap-3'>
                <div className="w-full frbc">
                    <div className="text-lg lg:text-xl text-white font-bold">{lng(lang, "clan name")}</div>
                    <div className="f-out f-mc s-0-7">
                        <input disabled={isFetching} value={input} onChange={e => {
                            setInput(e.target.value.length >= 12 ? e.target.value.slice(0, 12) : e.target.value);
                            setError('')
                        }}
                        className="f-inp f-mc s-0-7" type="text" name="" id="" placeholder={lng(lang, "clan name")} />
                    </div>
                </div>
                <div className="w-full frbc">
                    <div className="text-lg lg:text-xl text-white font-bold">{lng(lang, "clan icon")}</div>
                    <div className="fccc gap-1 lg:gap-2">
                        <canvas ref={canvasRef} className="w-16 h-16 lg:w-24 lg:h-24 border rounded-full border-white" width={64} height={64}></canvas>
                        <button onClick={e => {
                            const file = document.createElement('input')
                            file.type = "file"
                            file.accept = '.jpg, .jpeg, .png'
                            file.click()
                            file.addEventListener('change', e => {
                                const img = new Image()
                                img.src = URL.createObjectURL((file.files as FileList)[0] as File)
                                img.onload = () => {
                                    if(!canvasRef.current) return
                                    const size = canvasRef.current.width
                                    canvasRef.current.getContext('2d')?.drawImage(img, 0, 0, size, size)
                                    setIcon(canvasRef.current.toDataURL('image/png'))
                                }
                            })
                        }} disabled={isFetching} className="f-btn f-out f-mc s-0-5 text-sm lg:text-md">{lng(lang, "change")}</button>
                    </div>
                </div>
                <button disabled={isFetching} onClick={e => {
                    if(input.trim() == '') return setError('enter clanname')
                    if(!checkNick(input)) return setError('invalid clan name')
                    if(icon.trim() == '') return setError('input clan icon')
                    if(user.gold < 5000) return setError('not enough gold')
                    setIsFetching(true)
                    fetch(`/createClan/id/${user.id}`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            name:input,
                            icon
                        })
                    }).then(res => res.json()).then((res:{res:IUser}) => {
                        setIsFetching(false)
                        if(res.res){
                            setUser(res.res)
                            setState('my clan')
                        } else {
                            setError('something went wrong')
                        }
                    })
                }} className="w-full f-btn f-out f-mc s-0-7 text-md lg:text-lg">{lng(lang, "create")} - 5000G</button>
                <p className="text-red-500 font-bold text-sm lg:text-lg">{lng(lang, error)}</p>
            </div>:<></>
            }
        </div>
    </div>
}

export default ClanState