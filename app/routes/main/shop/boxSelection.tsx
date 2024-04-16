import {FC, Dispatch, SetStateAction} from 'react'

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
    return <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
    onClick={e => {
        if(e.target != e.currentTarget) return
        setOnBox(false)
    }}>
        <div className="box bg-[#000000aa] flex flex-row justify-center items-center gap-2 lg:gap-3 w-[80%] h-[80%] min-h-96 lg:min-h-128">
            {boxes.map((v, i) => {
                return <div key={i} className="box bg-cover bg-center w-16 h-16 lg:w-24 lg:h-24 cursor-pointer"
                style={{backgroundImage:`url(assets/boxes/${v.type}.png)`}}
                onClick={e => {
                    fetch(`/updateUser/id/${user.id}/box/${v.type}`).then(res => res.json()).then((res:{res:IUser}) => {
                        if(res.res){
                            setUser(res.res)
                            setOnBox(false)
                        }
                    })
                }}>
                    <div className="w-full h-full flex flex-col justify-center items-center rounded-md bg-[#00000077] text-white text-sm lg:text-xl font-bold">{v.price}</div>
                </div>
            })}
        </div>
    </div>
}

export default BoxSelection;