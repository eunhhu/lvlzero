import { Stage, Container, Sprite } from "@pixi/react"
import { FC, useEffect, useRef, useState } from "react"
import { Game as ServerGame } from "server/src/logic"
import * as usehooks from "usehooks-ts"
import * as PIXI from 'pixi.js';
import { lng } from "~/data/lang"

const Tilemap: FC<{
    tileset: string;
    tilemapData: [number, number][];
    tileWidth: number;
    tileHeight: number;
    size: number;
  }> = ({ tileset, tilemapData, tileWidth, tileHeight, size }) => {
    const containerRef = useRef<PIXI.Container>(new PIXI.Container());
    const [once, setOnce] = useState<boolean>(false)

    const isContain = (path:[number, number][], x:number, y:number):boolean => {
        for(let i = 0; i < path.length; i++) {
            if(path[i][0] === x && path[i][1] === y) return true
        }
        return false
    }

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
        const texture = PIXI.Texture.from(tileset);
        const curTexture = PIXI.Texture.from('assets/tiles/dirt.png');

        for(let i = 0; i < size; i++) {
            for(let j = 0; j < size; j++) {
                const tile = new PIXI.Sprite(isContain(tilemapData, j, i) ? curTexture : texture);
                tile.scale.x = tileWidth / tile.texture.width;
                tile.scale.y = tileHeight / tile.texture.height;
                tile.position.set(j * tileWidth - (tileWidth*size/2), i * tileHeight - (tileHeight*size/2));
                containerRef.current.addChild(tile);
            }
        }
    }, [tileset, tilemapData, tileWidth, tileHeight, size, once]);

    return <Container ref={containerRef} />;
};

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
        socket.emit('ready', user.id)
        socket.on('gameInit', (game:ServerGame) => {
            setGame(game)
        })
        return () => {
            socket.off('gameInit')
        }
    }, [once, socket])

    return (<>
        {game ? <><Stage width={width} height={height}>
            <Container pivot={[-width/2, -height/2]}>
                <Tilemap tileset="assets/tiles/grass.png" tilemapData={game.path} tileWidth={32} tileHeight={32} size={game.size} />
            </Container>
        </Stage></>:
        <div className="cover" style={{backgroundImage: `url(assets/tiles/grass.png)`}}>
            <div className="absolute bottom-0 right-0 text-white text-2xl font-bold">{lng(lang, 'loading')}</div>
        </div>
        }
    </>)
}

export default Play