import {FC, Dispatch, SetStateAction} from 'react'
import { lng } from '~/data/lang';

const outAttrs = ['_id', 'type', 'buy', 'tags']

const suffix:{[key:string]:string} = {
    "range":"m",
    "rate":"s",
    "cost":"c",
    "upgradeCost":"c"
}

const UnitContents:FC<{
    lang:string;
    selected:string;
    lvl:number;
    global:IDB;
}> = ({
    lang,
    selected,
    lvl,
    global
}) => {

    const displayValue = (attrs:{[key:string]:any}, key:string):string => {
        let result = key == 'cost' ? attrs[key] : attrs[key][lvl];
        if(key == 'rate') result = `${(+result) / 1000}`;
        const suf = Object.entries(suffix).find(v => v[0] == key);
        if(suf) result += suf[1];
        return `${result}`;
    }

    return selected !== 'l' && <div className='flex-1 flex flex-col justify-center items-center mr-4'>
        {Object.keys(global.units.find(v => v.type == selected) as {[key:string]:any}).map((v, i) => {
            if(outAttrs.includes(v)) return null;
            if(global.units.find(v => v.type == selected)?.upgradeCost.length as number <= lvl && v == 'upgradeCost') return null;
            const max:number = +(global.units as {[key:string]:any}[]).map(v2 => {
                return v == 'cost' ? v2[v] : v == 'rate' ? 1000/v2[v][v2.upgradeCost.length] : v2[v][v == 'upgradeCost' ? v2.upgradeCost.length-1 : v2.upgradeCost.length]
            }).sort((a,b) => b-a)[0];
            const tar = global.units.find(v => v.type == selected) as {[key:string]:any}
            const result:number = v == 'cost' ? +tar[v] : v == 'rate' ? 1000/+tar[v][lvl] : +tar[v][lvl]
            return <Displayer key={i} title={lng(lang, v)} display={displayValue(tar, v)} result={result} max={max} />
        })}
        {[''].map((v, i) => {
            let th = (global.units.find(v => v.type == selected) as {[key:string]:any})
            let dps = Math.round(th.damage[lvl] / (th.rate[lvl]/1000))
            return <Displayer key={i} title={lng(lang, 'dps')} display={`${dps}`} result={dps} max={700} />
        })}
        {[''].map((v, i) => {
            let th = (global.units.find(v => v.type == selected) as {[key:string]:any})
            let drrs = Math.round(th.damage[lvl] / (th.rate[lvl]/1000) * th.range[lvl] * th.bulletSpeed[lvl])
            return <Displayer key={i} title={lng(lang, 'drrs')} display={`${drrs}`} result={drrs} max={3000} />
        })}
    </div>
}

const Displayer:FC<{
    title:string;
    display:string;
    result:number;
    max:number;
}> = ({
    title,
    display,
    result,
    max
}) => {
    return <div className="flex flex-row justify-around items-center w-full p-1 lg:p-1.5 text-center">
        <div className="flex-1 text-sm lg:text-lg text-white font-bold">{title}</div>
        <div className="flex-1 text-sm lg:text-lg text-white font-bold">{display}</div>
        <div className='flex-1'>
            <div className='border-2 border-white w-full h-3 lg:h-4 rounded-full'>
                <div className={`h-full bg-blue-300 rounded-full text-black`} style={{width: `${result / max * 100}%`}}></div>
            </div>
        </div>
    </div>
}

export default UnitContents;