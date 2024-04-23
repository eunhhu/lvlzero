import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { lng } from "~/data/lang"

const settingsState = ['general', 'audio', 'graphic']

const GeneralSettings:FC<{lang:string, setLang:Dispatch<SetStateAction<string>>}> = ({lang, setLang}) => {
    return <div className='flex-1 fcsc w-full overflow-x-hidden overflow-y-auto p-1.5 lg:p-3 gap-1'>
        <div className="w-full f-backl f-out f-mc s-0-9 frbc">
            <div className="text-white font-bold text-lg lg:text-xl">{lng(lang, "language")}</div>
            <select value={lang} onChange={e => {
                localStorage.setItem('lang', e.target.value)
                setLang(e.target.value)
            }} className="f-sel f-mc s-0-7" name="" id="">
                <option value="en">English</option>
                <option value="ko">한국어</option>
            </select>
        </div>
    </div>
}

const AudioSettings:FC<{lang:string, setLang:Dispatch<SetStateAction<string>>}> = ({lang, setLang}) => {
    return <div className='flex-1 fcsc w-full overflow-x-hidden overflow-y-auto p-1.5 lg:p-3 gap-1'>
            
    </div>
}

const GraphicSettings:FC<{lang:string, setLang:Dispatch<SetStateAction<string>>}> = ({lang, setLang}) => {
    const [damageText, setDamageText] = useState<boolean>(localStorage.getItem('damageText') == '1' ? true : false)
    const [graphicFilter, setGraphicFilter] = useState<boolean>(localStorage.getItem('graphicFilter') == '1' ? true : false)
    const [hitEffect, setHitEffect] = useState<boolean>(localStorage.getItem('hitEffect') == '1' ? true : false)
    return <div className='flex-1 fcsc w-full overflow-x-hidden overflow-y-auto p-1.5 lg:p-3 gap-1'>
        <div className="w-full f-backl f-out f-mc s-0-9 frbc">
            <div className="text-white font-bold text-lg lg:text-xl">{lng(lang, "damage text")}</div>
            <div className="w-8 h-8 rounded-full bg-[#0009] fccc cursor-pointer" onClick={e => {
                setDamageText(!damageText)
                localStorage.setItem('damageText', damageText ? '0' : '1')
            }}>{damageText && <div className="w-4 h-4 rounded-full bg-white"></div>}</div>
        </div>
        <div className="w-full f-backl f-out f-mc s-0-9 frbc">
            <div className="text-white font-bold text-lg lg:text-xl">{lng(lang, "graphic filter")}</div>
            <div className="w-8 h-8 rounded-full bg-[#0009] fccc cursor-pointer" onClick={e => {
                setGraphicFilter(!graphicFilter)
                localStorage.setItem('graphicFilter', graphicFilter ? '0' : '1')
            }}>{graphicFilter && <div className="w-4 h-4 rounded-full bg-white"></div>}</div>
        </div>
        <div className="w-full f-backl f-out f-mc s-0-9 frbc">
            <div className="text-white font-bold text-lg lg:text-xl">{lng(lang, "hit effect")}</div>
            <div className="w-8 h-8 rounded-full bg-[#0009] fccc cursor-pointer" onClick={e => {
                setHitEffect(!hitEffect)
                localStorage.setItem('hitEffect', hitEffect ? '0' : '1')
            }}>{hitEffect && <div className="w-4 h-4 rounded-full bg-white"></div>}</div>
        </div>
    </div>
}


const SettingsState:FC<{stateHeight:string;lang:string, setLang:Dispatch<SetStateAction<string>>}> = ({stateHeight, lang, setLang}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [state, setState] = useState<string>('general')

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
    }, [once])

    return <><div className="fixed top-0 flex flex-col justify-center items-center w-full" style={{height: stateHeight}}>
        <div className='frac w-full gap-3 p-2'>
            {settingsState.map((sta, i) => {
                return <div key={i} className={`text-white text-center font-semibold cursor-pointer f-back f-out f-mc s-0-8 text-sm lg:text-lg flex-1 ${sta == state ? "f-back2" : ""}`} onClick={e => setState(sta)}>{lng(lang, sta)}</div>
            })}
        </div>
        {state == "general" ? <GeneralSettings lang={lang} setLang={setLang}/>:
        state == "audio" ? <AudioSettings lang={lang} setLang={setLang}/>:
        state == "graphic" ? <GraphicSettings lang={lang} setLang={setLang}/>:
        <></>}
    </div></>
}

export default SettingsState