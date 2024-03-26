interface User{
    id: string;
    username: string;
    password: string;
    gold: number;
    lvl: number;
    exp: number;
    unlocked: string[];
    equipped: string[];
}

interface glFCProps{
    lang:string,
    set:React.Dispatch<React.SetStateAction<string>>,
    user:User,
    setUser:React.Dispatch<React.SetStateAction<User>>
    socket:SocketIOClient.Socket,
    setSocket:React.Dispatch<React.SetStateAction<SocketIOClient.Socket>>
}

interface Room{
    name:string;
    users:InRoomUser[];
    maxUsers:number;
    private:boolean;
    status:string; // waiting, playing
    ownerName:string;
    ownerID:string; // socket id
    game:Game;
}

interface InRoomUser{
    id:string;
    username:string;
    lvl:number;
    socketId:string;
    coin:number;
    ready:boolean;
}

interface GameInitData{
    path:[number, number][];
    size:number;
}

interface GameTickData{
    health:number;
    units:UnitData[];
    enemies:EnemyData[];
    projectiles:ProjectileData[];
    waitingTimer:number;
}

interface UnitData{
    x:number;
    y:number;
    type:string;
    lvl:number;
}

interface EnemyData{
    x:number;
    y:number;
    health:number;
    type:string;
}

interface ProjectileData{
    x:number;
    y:number;
    angle:number;
    type:string;
}

interface UserSelectionData{
    x:number;
    y:number;
    type:string;
}