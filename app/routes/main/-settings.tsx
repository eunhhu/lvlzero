import { FC } from "react"
import { lng } from "~/data/lang"

const SettingsState:FC<{lang:string}> = ({lang}) => {
    return <div className="flex flex-col justify-center items-center">
        <div className="text-7xl font-bold text-white">Settings</div>
        <div className="text-3xl font-bold text-white">Coming Soon</div>
    </div>
}

export default SettingsState