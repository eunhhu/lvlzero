interface IUser{
    id: string;
    username: string;
    password: string;
    gold: number;
    lvl: number;
    exp: number;
    admin: boolean;
    unlocked: string[];
    equipped: string[];
    avatar: string;
    win: number;
    lose: number;
    lastPvp: number;
}

interface glFCProps{
    lang:string,
    set:React.Dispatch<React.SetStateAction<string>>,
    user:IUser,
    setUser:React.Dispatch<React.SetStateAction<IUser>>
    socket:SocketIOClient.Socket,
    setSocket:React.Dispatch<React.SetStateAction<SocketIOClient.Socket>>
}

interface IRoom{
    name:string;
    users:IInRoomUser[];
    maxUsers:number;
    private:boolean;
    status:string; // waiting, playing
    ownerName:string;
    ownerID:string; // socket id
    game:Game;
}

interface IInRoomUser{
    id:string;
    username:string;
    lvl:number;
    socketId:string;
    coin:number;
    ready:boolean;
    selection:IUserSelectionData;
}

interface IGameInitData{
    path:[number, number][];
    size:number;
    maxWave:number;
}

interface IGameTickData{
    health:number;
    units:UnitData[];
    enemies:EnemyData[];
    projectiles:ProjectileData[];
    waitingTimer:number;
}

interface IUnitData{
    x:number;
    y:number;
    type:string;
    lvl:number;
}

interface IEnemyData{
    x:number;
    y:number;
    health:number;
    maxHealth:number;
    type:string;
}

interface IProjectileData{
    x:number;
    y:number;
    angle:number;
    type:string;
}

interface IUserSelectionData{
    x:number;
    y:number;
    type:string;
}

interface IUnit{
    type:string;
    damage: number[];
    rate: number[];
    range: number[];
    bulletSpeed: number[];
    cost: number;
    upgradeCost: number[];
    buy: number;
    tags: string[];
}

interface IEnemy{
    type:string;
    health:number;
    speed:number;
    coin:number;
    tags:string[];
}

interface ILevel{
    enemies:string[][];
}

interface IMotion{
    delay:number; // ms
    duration:number; // ms
    type:mothionType; // x, y, scale, rotation
    ease:string; // linear, easeIn, easeOut, easeInOut
    startValue:number; // x, y, scale, rotation
    endValue:number; // x, y, scale, rotation
}
type mothionType = 'x' | 'y' | 'scale' | 'rotation';