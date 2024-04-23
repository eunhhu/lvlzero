import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { lng } from "~/data/lang"

const SettingsState:FC<{stateHeight:string;lang:string, setLang:Dispatch<SetStateAction<string>>}> = ({stateHeight, lang, setLang}) => {
    const [once, setOnce] = useState<boolean>(false)

    
    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
    }, [once])

    return <div className="fixed top-0 fccc w-full gap-1" style={{height: stateHeight}}>
        <div className="box w-[80%] h-[80%] fccc">
            <div className="flex flex-row justify-between items-center w-full pl-5 pr-5 p-2 lg:pl-10 lg:pr-10 lg:p-5">
                <h1 className="font-bold text-lg lg:text-xl">{lng(lang, 'language')}</h1>
                <select className="text-sm lg:text-md" name="" id="" value={lang} onChange={e => {
                    localStorage.setItem('lang', e.target.value)
                    setLang(e.target.value)
                }}>
                    <option value="en">English</option>
                    <option value="ko">한국어</option>
                </select>
            </div>
        </div>
    </div>
}



export default SettingsState