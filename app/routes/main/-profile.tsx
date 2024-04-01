import {Dispatch, FC, SetStateAction} from 'react'
import { lng } from '~/data/lang';

const ProfileState:FC<{lang:string; user:IUser; setUser:Dispatch<SetStateAction<IUser|null>>; set:Dispatch<SetStateAction<string>>}> = ({lang, user, setUser, set}) => {
    return <div className="fixed top-0 flex flex-col justify-center items-center w-full" style={{height: `calc(100% - 76px)`}}>
        <div style={{width:'80%'}} className='h-full flex flex-col justify-around items-start p-3 gap-3'>
            <div className='box w-full p-2 flex flex-row items-center justify-start gap-3'>
                <img src={user.avatar == "default" ? "assets/icons/profile.svg" : user.avatar} alt="" width={100} className='box' />
                <div className='flex flex-col flex-1'>
                    <h1 className='text-3xl font-semibold'>{user.username}</h1>
                    <h2 className='text-xl font-semibold'>Lv.{user.lvl}</h2>
                    <h3 className='text-lg'>{user.exp}/{100 + user.lvl**2*10}</h3>
                </div>
                <div className='flex flex-col items-center justify-center gap-2 w-32'>
                    <button className='w-full' onClick={e => {

                    }}>{lng(lang, "edit")}</button>
                    <button className='w-full' onClick={e => {
                        localStorage.removeItem("userId")
                        setUser(null)
                        set('login')
                    }}>{lng(lang, "logout")}</button>
                </div>
            </div>
            <div className="box flex-1 w-full p-2 font-semibold text-lg flex flex-col justify-center items-center gap-3">
                <div>{lng(lang, 'win')} {user.win}</div>
                <div>{lng(lang, 'lose')} {user.lose}</div>
                <div>{lng(lang, 'winrate')} {user.lose == 0 ? 0 : user.win / user.lose * 100}%</div>
            </div>
        </div>
    </div>
}

export default ProfileState