import {FC, Dispatch, SetStateAction, useState} from 'react'
import { lng } from '~/data/lang';

const boxes = [
    {type:"iron", price:1000, quality:'D'},
    {type:"gold", price:1500, quality:'C'},
    {type:"diamond", price:2000, quality:'B'},
    {type:"ruby", price:2500, quality:'A'},
    {type:"obsidian", price:3000, quality:'S'}
]

const BoxSelection:FC<{
    user:IUser;
    setUser:Dispatch<SetStateAction<IUser>>;
    lang:string;
    setOnBox:Dispatch<SetStateAction<boolean>>;
}> = ({
    user,
    setUser,
    lang,
    setOnBox
}) => {
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [opened, setOpened] = useState<string>('')
    const [error, setError] = useState<string>('')

    return <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
    onClick={e => {
        if(isFetching) return
        if(e.target != e.currentTarget) return
        setOnBox(false)
    }}>
        <div className="box bg-[#000000aa] flex flex-col justify-center items-center w-[80%] h-[60%] min-h-48 lg:min-h-96">
            <div className='flex-1 flex flex-row justify-center items-center gap-2 lg:gap-3'>
                {boxes.map((v, i) => {
                    return <div key={i} className='flex flex-col gap-1 lg:gap-2 justify-center items-center'>
                        <div className="box bg-cover bg-center w-16 h-16 lg:w-24 lg:h-24 cursor-pointer"
                        style={{backgroundImage:`url(assets/boxes/${v.type}.png)`}}>
                            <div className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000022] text-white text-sm lg:text-xl font-bold">{v.price}</div>
                        </div>
                        <button disabled={isFetching} className={`w-full p-1 lg:p-1.5 text-sm lg:text-lg font-semibold ${isFetching ? 'text-red-500' : ""}`}
                        onClick={e => {
                            if(user.gold < v.price){
                                setError("not enough gold")
                                return
                            }
                            if(isFetching) return
                            setOpened('')
                            setIsFetching(true)
                            fetch(`/updateUser/id/${user.id}/box/${v.type}`).then(res => res.json()).then((res:{res:IUser;mod:string}) => {
                                setIsFetching(false)
                                if(res.res){
                                    setUser(res.res)
                                    setOpened(res.mod)
                                } else {
                                    setError("not enough gold")
                                }
                            })
                        }}>{lng(lang, "purchase")}</button>
                    </div>
                })}
            </div>
            <p className='text-red-400 font-semibold text-md lg:text-lg noshadow'>{lng(lang, error)}</p>
            <div className='flex-1 flex flex-row justify-center items-center'>
                <div className='box w-24 h-24 lg:w-48 lg:h-48 bg-cover bg-center text-4xl lg:text-6xl font-bold text-center flex flex-col justify-center items-center' style={{
                    backgroundImage:opened ? `url(assets/modules/${opened.split('-')[0]}.png)` : "none"
                }}>{opened && opened.split('-')[1].toUpperCase()}</div>
            </div>
        </div>
    </div>
}

export default BoxSelection;