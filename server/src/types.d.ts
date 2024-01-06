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
    users:{id:string;username:string;socketId:string;coin:number}[];
    maxUsers:number;
    private:boolean;
    status:string;
    ownerName:string;
    ownerID:string; // socket id
    game:Game;
}
