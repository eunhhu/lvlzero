import { FC, Dispatch, SetStateAction, useState, useEffect, useRef } from "react";
import { lng } from "~/data/lang";
import { checkClan } from "~/data/utils";

const MyClanSettings:FC<{
    lang:string;
    clan:IClan;
    setClan:Dispatch<SetStateAction<IClan|null>>;
    isFetching:boolean;
    setIsFetching:Dispatch<SetStateAction<boolean>>;
}> = ({lang, clan, setClan, isFetching, setIsFetching}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [clanName, setClanName] = useState<string>("")
    const [icon, setIcon] = useState<string>("")
    const [error, setError] = useState<string>("")
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        setOnce(true)
    }, [])
    useEffect(() => {
        if(!once) return
        setClanName(clan.name)
        setIcon(clan.icon)

        if(canvasRef.current) {
            const img = new Image()
            img.src = clan.icon
            img.onload = () => {
                const size = (canvasRef.current as HTMLCanvasElement).width;
                (canvasRef.current as HTMLCanvasElement).getContext('2d')?.drawImage(img, 0, 0, size, size);
            }
        }
    }, [once])

    const changeImage = () => {
        setError("")
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
    }

    const save = (type:string, value:string) => {
        setError("")
        setIsFetching(true)
        fetch(`clanBy/id/${clan.id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({[type]:value})
        }).then(res => res.json()).then((data:IClan) => {
            if(!data) return setError("something went wrong")
            setClan(data)
            setIsFetching(false)
        })
    }

    return <div className="fcsc flex-1 h-full f-backl s-0-7 text-white gap-1 lg:gap-2 p-1.5 lg:p-3 overflow-x-hidden overflow-y-auto">
        <div className="w-full f-backl f-out f-mc s-0-9 frbc">
            <div className="w-full frs text-white font-bold text-lg lg:text-xl">{lng(lang, "clan name")}</div>
            <div className="w-full frec gap-1 lg:gap-2">
                <input type="text" className="f-inp s-0-8 text-sm lg:text-lg" value={clanName} onChange={e => {setClanName(e.target.value);setError("")}} />
                <button onClick={e => {
                    if(clanName.trim() == '') return setError('clan name required');
                    if(!checkClan(clanName)) return setError("invalid clan name");
                    if(clan.gold < 5000) return setError('not enough clan gold');
                    save('name', clanName)
                }} disabled={clan.name == clanName || isFetching} className="f-btn s-0-7 text-sm lg:text-lg">{lng(lang, "change")} - 5000G</button>
            </div>
        </div>
        <div className="w-full f-backl f-out f-mc s-0-9 frbc">
            <div className="w-full frs text-white font-bold text-lg lg:text-xl">{lng(lang, "clan icon")}</div>
            <div className="w-full frec gap-1 lg:gap-2">
                <canvas onClick={changeImage} ref={canvasRef} width={64} height={64} className="w-8 h-8 lg:w-12 lg:h-12 rounded-md lg:rounded-lg"></canvas>
                <button onClick={e => {
                    if(clan.gold < 5000) return setError('not enough clan gold');
                    save('icon', icon)
                }} disabled={clan.icon == icon || isFetching} className="f-btn s-0-7 text-sm lg:text-lg">{lng(lang, "change")} - 5000G</button>
            </div>
        </div>
        <p className="w-full text-red-500 font-bold text-sm lg:text-lg text-center">{lng(lang, error)}</p>
    </div>
}

export default MyClanSettings;