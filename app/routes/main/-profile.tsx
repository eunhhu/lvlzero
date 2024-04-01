import {Dispatch, FC, SetStateAction, useEffect, useState} from 'react'
import { lng } from '~/data/lang';
import { checkNick } from '~/data/utils';

const ProfileState:FC<{lang:string; user:IUser; setUser:Dispatch<SetStateAction<IUser|null>>; set:Dispatch<SetStateAction<string>>}> = ({lang, user, setUser, set}) => {
    const [edit, setEdit] = useState<boolean>(false)
    const [avatar, setAvatar] = useState<string>(user.avatar)
    const [username, setUsername] = useState<string>(user.username)
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
                    <h1 className='text-3xl font-semibold'>{user.username}</h1>
                    <h2 className='text-xl font-semibold'>Lv.{user.lvl}</h2>
                    <h3 className='text-lg'>{user.exp}/{100 + user.lvl**2*10}</h3>
                </div>
                <div className='flex flex-col items-center justify-center gap-2 w-32'>
                    <button className='w-full' onClick={e => {
                        setEdit(!edit);
                    }}>{lng(lang, "edit")}</button>
                    <button className='w-full' onClick={e => {
                        localStorage.removeItem("userId");
                        setUser(null);
                        set('login');
                    }}>{lng(lang, "logout")}</button>
                </div>
            </div>
            <div className="box flex-1 w-full p-2 font-semibold text-lg flex flex-col justify-center items-center gap-3">
                <div>{lng(lang, 'win')} {user.win}</div>
                <div>{lng(lang, 'lose')} {user.lose}</div>
                <div>{lng(lang, 'winrate')} {user.lose == 0 ? 0 : user.win / user.lose * 100}%</div>
            </div>
        </div>
        {edit && <div className="fixed w-full h-full bg-[#00000099] flex flex-col justify-center items-center"
        onClick={e => {
            if(e.target != e.currentTarget) return;
            setEdit(false);
        }
        }>
            <div className="box w-80 bg-[#ffffff22] p-5 flex flex-col justify-center items-center gap-3">
                <input type="text" name="" id="" placeholder={lng(lang, 'username')} value={username} onChange={e => {setUsername(e.target.value);setError('')}} />
                <img src={avatar === 'default' ? 'assets/icons/profile.svg' : avatar} alt="" width={100} className='box' />
                <select name="" id="" value={avatar} onChange={e => setAvatar(e.target.value)}>
                    <option value="default">Default</option>
                    <option value="assets/avatars/1.png">Avatar 1</option>
                    <option value="assets/avatars/2.png">Avatar 2</option>
                    <option value="assets/avatars/3.png">Avatar 3</option>
                </select>
                <div className='text-red-500 noshadow'>{lng(lang, error)}</div>
                <button disabled={isFetching} style={{opacity : isFetching ? 0.5 : 1}} onClick={e => {
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
        </div>}
    </div>
}

export default ProfileState