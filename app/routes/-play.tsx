import { Stage, Container, Sprite } from "@pixi/react"
import { FC, useEffect, useRef, useState } from "react"
import * as usehooks from "usehooks-ts"
import * as PIXI from 'pixi.js';
import { lng } from "~/data/lang"

const Tilemap: FC<{
    tileset: string;
    tilemapData: [number, number][];
    tileSize: number;
    size: number;
  }> = ({ tileset, tilemapData, tileSize, size }) => {

    return tilemapData.map((tile, index) => {
        return (
            <Sprite
            key={index}
            x={tile[0] * tileSize - size * tileSize/2}
            y={tile[1] * tileSize - size * tileSize/2}
            texture={PIXI.Texture.from(tileset)}
            scale={tileSize / 256}
            />
        );
    });
};

const Play:FC<glFCProps> = ({lang, set, user, setUser, socket, setSocket}) => {
    const {width, height} = usehooks.useWindowSize()
    const [once, setOnce] = useState<boolean>(false)
    const [game, setGame] = useState<GameInitData>()
    const [tileSize, setTileSize] = useState<number>(Math.min(width, height) / (game || {size:1}).size)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [units, setUnits] = useState<UnitData[]>([])
    const [enemies, setEnemies] = useState<EnemyData[]>([])
    const [projectiles, setProjectiles] = useState<ProjectileData[]>([])
    const [selectedUnit, setSelectedUnit] = useState<UnitData|null>(null)

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

    useEffect(() => {
        if(!game) return
        setTileSize(Math.min(width, height) / game.size)
    }, [game, width, height])

    return (<>
        {game ? <><Stage width={width} height={height}>
            <Container pivot={[-width/2, -height/2]}>
                <Tilemap
                    tileset="assets/tiles/grass.png"
                    tilemapData={game.path}
                    tileSize={tileSize}
                    size={game.size}
                />
                {units.map((unit, index) => {
                    return (
                        <Sprite
                        key={index}
                        x={unit.x * tileSize - game.size * tileSize/2}
                        y={unit.y * tileSize - game.size * tileSize/2}
                        texture={PIXI.Texture.from(`assets/units/${unit.type}.png`)}
                        scale={tileSize / 256}
                        />
                    );
                })}
                {enemies.map((enemy, index) => {
                    return (
                        <Sprite
                        key={index}
                        x={enemy.x * tileSize - game.size * tileSize/2}
                        y={enemy.y * tileSize - game.size * tileSize/2}
                        texture={PIXI.Texture.from(`assets/enemies/${enemy.type}.png`)}
                        scale={tileSize / 256}
                        />
                    );
                })}
                {projectiles.map((projectile, index) => {
                    return (
                        <Sprite
                        key={index}
                        x={projectile.x * tileSize - game.size * tileSize/2}
                        y={projectile.y * tileSize - game.size * tileSize/2}
                        texture={PIXI.Texture.from('assets/tiles/grass.png')}
                        scale={tileSize / 256}
                        />
                    );
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