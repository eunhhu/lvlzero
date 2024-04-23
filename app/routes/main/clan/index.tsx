import { FC, useState } from "react";

const ClanState:FC<{stateHeight:string}> = ({stateHeight}) => {
    const [once, setOnce] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)

    return <div className="fccc w-full fixed top-0" style={{height:stateHeight}}>Clan</div>
}

export default ClanState