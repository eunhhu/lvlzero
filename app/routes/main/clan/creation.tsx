import { Dispatch, FC, SetStateAction, useRef, useState } from "react";
import { lng } from "~/data/lang";
import { checkClan } from "~/data/utils";

const ClanCreation:FC<{lang:string; user:IUser; setUser:Dispatch<SetStateAction<IUser>>; setState:Dispatch<SetStateAction<string>>; refresh:(goto?:boolean) => void}> = ({lang, user, setUser, setState, refresh}) => {
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [input, setInput] = useState<string>("")
    const [icon, setIcon] = useState<string>("")
    const canvasRef = useRef<HTMLCanvasElement>(null)

    return <div className='flex-1 fcac w-full pl-12 pr-12 lg:pl-24 lg:pr-24 gap-1 lg:gap-3'>
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
            if(input.trim() == '') return setError('clan name required')
            if(!checkClan(input)) return setError('invalid clan name')
            if(icon.trim() == '') return setError('clan icon required')
            if(user.lvl < 15) return setError('level 15 required')
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
                    refresh(true)
                } else {
                    setError('something went wrong')
                }
            })
        }} className="w-full f-btn f-out f-mc s-0-7 text-md lg:text-lg">{lng(lang, "create clan")} (Lv.15) - 5000G</button>
        <p className="text-red-500 font-bold text-sm lg:text-lg">{lng(lang, error)}</p>
    </div>
}

export default ClanCreation;