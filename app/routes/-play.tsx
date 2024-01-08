import { Stage, Container, Sprite } from "@pixi/react"
import { FC, useEffect, useState } from "react"
import { Game as ServerGame } from "server/src/logic"
import * as usehooks from "usehooks-ts"
import * as PIXI from 'pixi.js';
import { lng } from "~/data/lang"

const Play:FC<glFCProps> = ({lang, set, user, setUser, socket, setSocket}) => {
    const {width, height} = usehooks.useWindowSize()
    const [once, setOnce] = useState<boolean>(false)
    const [game, setGame] = useState<ServerGame>()
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
        if(!socket) return
        socket.emit('ready', user)
        socket.on('gameInit', (game:ServerGame) => {
            setGame(game)
        })
        return () => {
            socket.off('gameInit')
        }
    }, [once, socket])

    return (<>
        {game ? <Stage width={width} height={height}>
            <Container pivot={[width/2, height/2]}>
                {Array(game.size).fill(0).map((_, i) => {
                    return Array(game.size).fill(0).map((_, j) => {
                        return <Sprite key={`${i}${j}`} width={100} height={100} anchor={0.5}
                        ></Sprite>
                    })
                })}
            </Container>
        </Stage>:
        <div className="cover" style={{backgroundImage: `url(assets)`}}>
            <div className="absolute bottom-0 right-0 text-white text-2xl font-bold">{lng(lang, 'loading')}</div>
        </div>
        }
    </>)
}

export default Play