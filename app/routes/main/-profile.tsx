import {Dispatch, FC, SetStateAction, useEffect, useState} from 'react'
import { lng } from '~/data/lang';
import { checkNick, checkPass, sha256 } from '~/data/utils';

const ProfileState:FC<{lang:string; user:IUser; setUser:Dispatch<SetStateAction<IUser|null>>; set:Dispatch<SetStateAction<string>>; isMobile:boolean}> = ({lang, user, setUser, set, isMobile}) => {
    const [edit, setEdit] = useState<boolean>(false)
    const [avatar, setAvatar] = useState<string>(user.avatar)
    const [username, setUsername] = useState<string>(user.username)
    const [password, setPassword] = useState<string>('')
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        setAvatar(user.avatar);
        setUsername(user.username);
        setError('');
    }, [edit]);

    return <div className="fixed top-0 flex flex-col justify-center items-center w-full" style={{height: `calc(100% - 76px)`}}>
        <div style={{width:'80%'}} className='h-full flex flex-col justify-around items-start p-3 gap-3'>
            <div className='box w-full p-2 flex flex-row items-center justify-start gap-3'>
                <img src={user.avatar == "default" ? "assets/icons/profile.svg" : user.avatar} alt="" width={100} className='box' />
                <div className='flex flex-col flex-1'>
                    <h1 className='text-lg lg:text-3xl font-semibold'>{user.username}</h1>
                    <h2 className='text-md lg:text-xl font-semibold'>Lv.{user.lvl}</h2>
                    <h3 className='text-sm lg:text-lg'>{user.exp}/{100 + user.lvl**2*10}</h3>
                </div>
                <div className='flex flex-col items-center justify-center gap-2 w-32'>
                    <button className='text-sm lg:text-lg w-full' onClick={e => {
                        setEdit(!edit);
                    }}>{lng(lang, "edit")}</button>
                    <button className='text-sm lg:text-lg w-full' onClick={e => {
                        localStorage.removeItem("userId");
                        setUser(null);
                        set('login');
                    }}>{lng(lang, "logout")}</button>
                </div>
            </div>
            <div className="box flex-1 w-full p-2 font-semibold text-lg flex flex-col justify-center items-center gap-3">
                <div className='text-sm lg:text-lg'>{lng(lang, 'win')} {user.win}</div>
                <div className='text-sm lg:text-lg'>{lng(lang, 'lose')} {user.lose}</div>
                <div className='text-sm lg:text-lg'>{lng(lang, 'winrate')} {user.lose == 0 ? 0 : (user.win / (user.win + user.lose) * 100).toFixed(2)}%</div>
                <div className='text-sm lg:text-lg'>{lng(lang, 'rating')} {user.win - user.lose}</div>
            </div>
        </div>
        {edit && <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
        onClick={e => {
            if(e.target != e.currentTarget) return;
            setEdit(false);
        }
        }>
            <div className="box w-80 bg-[#ffffff22] p-3 lg:p-5 flex flex-col justify-center items-center gap-1.5 lg:gap-3">
                <div className='w-full flex flex-row justify-between items-center'>
                    <input className='w-[80%] text-sm lg:text-lg' type="text" name="" id="" placeholder={lng(lang, 'username')} value={username} onChange={e => {setUsername(e.target.value);setError('')}} />
                    <button className='text-sm lg:text-md pr-1.5 pl-1.5 p-1 lg:pr-2 lg:pl-2 lg:p-1.5 h-full' disabled={isFetching} style={{opacity : isFetching ? 0.5 : 1}} onClick={e => {
                        if(!username) return setError('enter username');
                        if(!checkNick(username)) return setError('username must be 3~12 characters long including numbers and alphabets');
                        setError('');
                        setIsFetching(true);
                        fetch(`/updateUser/id/${user.id}/type/username/value/${username}`)
                        .then(res => res.json())
                        .then((res:{res:IUser}) => {
                            setIsFetching(false)
                            if(!res.res) {
                                (res as any).message && setError((res as any).message)
                            } else {
                                setUser(res.res)
                                setEdit(false)
                            }
                        });
                    }}>{lng(lang, 'save')}</button>
                </div>
                <div className='w-full flex flex-row justify-between items-center'>
                    <input className='w-[80%] text-sm lg:text-lg' type="password" name="" id="" placeholder={lng(lang, 'new password')} value={password} onChange={e => {setPassword(e.target.value);setError('')}} />
                    <button className='text-sm lg:text-md pr-1.5 pl-1.5 p-1 lg:pr-2 lg:pl-2 lg:p-1.5 h-full' disabled={isFetching} style={{opacity : isFetching ? 0.5 : 1}} onClick={e => {
                        if(!password) return setError('enter password');
                        if(!checkPass(password)) return setError('password must be more than 8 characters long including numbers and alphabets');
                        setError('');
                        setIsFetching(true);
                        fetch(`/updateUser/id/${user.id}/type/password/value/${sha256(password)}`)
                        .then(res => res.json())
                        .then((res:{res:IUser}) => {
                            setIsFetching(false)
                            if(!res.res) {
                                (res as any).message && setError((res as any).message)
                            } else {
                                setUser(res.res)
                                setEdit(false)
                            }
                        });
                    }}>{lng(lang, 'save')}</button>
                </div>
                <img width={isMobile ? 80 : 100} height={isMobile ? 80 : 100} src={avatar === 'default' ? 'assets/icons/profile.svg' : avatar} alt="" className='box' />
                <select className='text-sm lg:text-lg' name="" id="" value={avatar} onChange={e => setAvatar(e.target.value)}>
                    <option value="default">Default</option>
                    <option value="assets/avatars/1.png">Avatar 1</option>
                    <option value="assets/avatars/2.png">Avatar 2</option>
                    <option value="assets/avatars/3.png">Avatar 3</option>
                </select>
                <div className='text-red-500 noshadow text-sm lg:text-md font-semibold'>{lng(lang, error)}</div>
            </div>
        </div>}
    </div>
}

export default ProfileState