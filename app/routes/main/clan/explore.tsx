import { Dispatch, FC, SetStateAction, useState } from "react";
import { lng } from "~/data/lang";
import { getTotalClanExp } from "~/data/utils";


const ClanExplore:FC<{
    lang:string;
    clans:IClan[];
    setClanProf:Dispatch<SetStateAction<IClan|null>>;
}> = ({lang, clans, setClanProf}) => {
    const [search, setSearch] = useState<string>("")

    return <>
        <div className="f-out f-mc s-0-8 w-full m-1 lg:m-2"><input placeholder={lng(lang, "search")} className="f-inp f-mc s-0-8 w-full" type="text" name="" id="" value={search} onChange={e => setSearch(e.target.value)} /></div>
        {clans.filter(v => v.name.match(search)).sort((a, b) => {
            const aTotal = getTotalClanExp(a.level-1) + a.exp;
            const bTotal = getTotalClanExp(b.level-1) + b.exp;
            return bTotal - aTotal
        }).map((v, i) => {
            return <div key={i} className='w-full flex flex-row justify-between items-center p-2 bg-[#ffffff22] hover:bg-[#ffffff33] cursor-pointer rounded-md text-white'
            onClick={e => setClanProf(v)}>
                <div className='flex flex-row justify-start items-center gap-3'>
                    <img src={v.icon == "default" ? "assets/icons/profile.svg" : v.icon} alt="" width={50} className='box' />
                    <div className='flex flex-col'>
                        <h1 className='text-lg lg:text-xl font-semibold'>{v.name}</h1>
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
        })}
    </>
}

export default ClanExplore;