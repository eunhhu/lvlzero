import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { lng } from "~/data/lang"
import GeneralSettings from "./general"
import AudioSettings from "./audio"
import GraphicSettings from "./graphic"

const settingsState = ['general', 'audio', 'graphic']

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