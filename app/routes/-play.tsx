import { Stage, Container, Sprite } from "@pixi/react"
import { FC, useEffect, useRef, useState } from "react"
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

    return tilemapData.map((tile, index) => {
        const x = index % size;
        const y = Math.floor(index / size);
        return (
          <Sprite
            key={index}
            source={tileset}
            x={x * tileWidth}
            y={y * tileHeight}
            width={tileWidth}
            height={tileHeight}
          />
        );
    });
};

const Play:FC<glFCProps> = ({lang, set, user, setUser, socket, setSocket}) => {
    const {width, height} = usehooks.useWindowSize()
    const [once, setOnce] = useState<boolean>(false)
    const [game, setGame] = useState<GameInitData>()
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [units, setUnits] = useState<UnitData[]>([])
    const [enemies, setEnemies] = useState<EnemyData[]>([])
    const [projectiles, setProjectiles] = useState<ProjectileData[]>([])

    useEffect(() => {
        setOnce(true)
    }, [])

    useEffect(() => {
        if(!once) return
        if(!socket) return
        socket.emit('ready', user.id)
        socket.on('gameInit', (game:GameInitData) => {
            setGame(game)
        })
        socket.on('gameUpdate', (tickData:GameTickData) => {
            console.log(tickData)
            setUnits(tickData.units)
            setEnemies(tickData.enemies)
            setProjectiles(tickData.projectiles)
        })
        socket.on('roomDeleted', () => {
            set('main')
        })
        return () => {
            socket.off('gameInit')
        }
    }, [once, socket])

    return (<>
        {game ? <><Stage width={width} height={height}>
            <Container pivot={[-width/2, -height/2]}>
                <Tilemap
                    tileset="assets/tiles/grass.png"
                    tilemapData={game.path}
                    tileWidth={32}
                    tileHeight={32}
                    size={game.size}
                />
                {units.map((unit, index) => {
                    return <Sprite key={index} x={unit.x * 32} y={unit.y * 32} texture={PIXI.Texture.from(`assets/units/${unit.type}.png`)} />
                })}
                {enemies.map((enemy, index) => {
                    return <Sprite key={index} x={enemy.x * 32} y={enemy.y * 32} texture={PIXI.Texture.from(`assets/enemies/${enemy.type}.png`)} />
                })}
                {projectiles.map((projectile, index) => {
                    return <Sprite key={index} x={projectile.x * 32} y={projectile.y * 32} texture={PIXI.Texture.from(`assets/projectiles/${projectile.type}.png`)} />
                })}
            </Container>
        </Stage></>:
        <div className="cover" style={{backgroundImage: `url(assets/tiles/grass.png)`}}>
            <div className="absolute bottom-0 right-0 text-white text-2xl font-bold">{lng(lang, 'loading')}</div>
        </div>
        }
    </>)
}

export default Play