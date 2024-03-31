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
    user:User,
    setUser:React.Dispatch<React.SetStateAction<User>>
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