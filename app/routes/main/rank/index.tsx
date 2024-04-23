import {FC, useEffect, useState} from 'react'
import { lng } from '~/data/lang'
import { getTotalExp } from '~/data/utils'

const rankStates = ['level', 'winrate', 'rating']

const RankState:FC<{stateHeight:string;lang:string}> = ({stateHeight,lang}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [state, setState] = useState<string>(rankStates[0])
    const [users, setUsers] = useState<IUser[]>([])
    const [profile, setProfile] = useState<IUser>()

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
        fetch('/getAllUsers').then(res => res.json()).then((res:{res:IUser[]}) => {
            setUsers(res.res)
        })
    }, [once])

    return <><div className="fixed top-0 flex flex-col justify-center items-center w-full" style={{height: stateHeight}}>
        <div className='frac w-full gap-3 p-2'>
            {rankStates.map((sta, i) => {
                return <div key={i} className={`text-white text-center font-semibold cursor-pointer f-back f-out f-mc s-0-8 text-sm lg:text-lg flex-1 ${sta == state ? "f-back2" : ""}`} onClick={e => setState(sta)}>{lng(lang, sta)}</div>
            })}
        </div>
        <div className='flex-1 fcsc w-full overflow-x-hidden overflow-y-auto p-1 gap-1'>
            {(
                state == 'level' ? users.sort((a, b) => {
                    let aTotalExp = (a.exp + getTotalExp(a.lvl-1));
                    let bTotalExp = (b.exp + getTotalExp(b.lvl-1));
                    return bTotalExp - aTotalExp;
                }) :
                state == 'winrate' ? users.sort((a, b) => {
                    let awr = a.win / (a.win + a.lose == 0 ? 1 : a.win + a.lose)
                    let bwr = b.win / (b.win + b.lose == 0 ? 1 : b.win + b.lose)
                    return bwr - awr
                }) :
                state == 'rating' ? users.sort((a, b) => b.rate - a.rate) :
                users.sort((a, b) => +a.id - +b.id)
            ).map((v, i) => {
                return <div key={i} className='w-full flex flex-row justify-between items-center p-2 bg-[#ffffff22] hover:bg-[#ffffff33] cursor-pointer rounded-md text-white'
                onClick={e => setProfile(v)}>
                    <div className='flex flex-row justify-start items-center gap-3'>
                        <img src={v.avatar == "default" ? "assets/icons/profile.svg" : v.avatar} alt="" width={50} className='box' />
                        <div className='flex flex-col'>
                            <h1 className='text-lg lg:text-xl font-semibold'>{i+1}. {v.username}</h1>
                            <h2 className='text-md lg:text-lg font-semibold'>Lv.{v.lvl}</h2>
                            <h3 className='text-sm lg:text-md'>{v.exp}/{100 + v.lvl**2*10}</h3>
                        </div>
                    </div>
                    <div className='flex flex-col justify-center items-end gap-2'>
                        <div className='text-sm lg:text-md'>{lng(lang, 'win')} {v.win}</div>
                        <div className='text-sm lg:text-md'>{lng(lang, 'lose')} {v.lose}</div>
                        <div className='text-sm lg:text-md'>{lng(lang, 'winrate')} {v.lose == 0 ? 0 : (v.win / (v.win + v.lose) * 100).toFixed(2)}%</div>
                        <div className='text-sm lg:text-md'>{lng(lang, 'rating')} {v.rate}</div>
                    </div>
                </div>
            })}
        </div>
    </div>
    {profile && <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
    onClick={e => {
        if(e.target != e.currentTarget) return
        setProfile(undefined)
    }}>
        <div className="f-backl s-0-8 w-80 p-3 lg:p-5 flex flex-col justify-center items-center gap-1.5 lg:gap-3">
            <div className='w-full frbc gap-2 lg:gap-3'>
                <img src={profile.avatar == "default" ? "assets/icons/profile.svg" : profile.avatar} alt="" width={100} className='f-back2l s-0-8' />
                <div className='flex flex-col w-full text-white'>
                    <h1 className='text-lg lg:text-xl font-semibold'>{profile.username}</h1>
                    <h2 className='text-md lg:text-lg font-semibold'>Lv.{profile.lvl}</h2>
                    <h3 className='text-sm lg:text-md'>{profile.exp}/{100 + profile.lvl**2*10}</h3>
                </div>
            </div>
            <div className="f-back2l s-0-8 flex-1 w-full p-1 lg:p-2 font-semibold text-lg fccc gap-3 text-white">
                <div className='text-sm lg:text-md'>{lng(lang, 'win')} {profile.win}</div>
                <div className='text-sm lg:text-md'>{lng(lang, 'lose')} {profile.lose}</div>
                <div className='text-sm lg:text-md'>{lng(lang, 'winrate')} {profile.lose == 0 ? 0 : (profile.win / (profile.win + profile.lose) * 100).toFixed(2)}%</div>
                <div className='text-sm lg:text-md'>{lng(lang, 'rating')} {profile.rate}</div>
            </div>
        </div>
    </div>}
    </>
}

export default RankState