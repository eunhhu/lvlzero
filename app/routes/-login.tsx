import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { lng } from "~/data/lang";
import { checkNick, checkPass, sha256 } from "~/data/utils";

const opposite = (state:string) => state === 'login' ? 'register' : 'login'

const isProduction = process.env.NODE_ENV === 'production'
const socketDomain = isProduction ? 'https://lvlzero.onrender.com' : 'http://127.0.0.1:3002'
const socketNeed:boolean = isProduction;

const Login:FC<glFCProps> = ({lang, set, setUser, setSocket, global, isMobile}) => {
  const [once, setOnce] = useState<boolean>(false)
    const [state, setState] = useState<string>('login')
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [isFetching, setIsFetching] = useState<boolean>(false)

    useEffect(() => {
      setOnce(true)
    }, [])

    const tryLogin = async (user:IUser) => {
      if(user.banned) {
        localStorage.removeItem('userId')
        setError('banned user')
        setIsFetching(false)
        return;
      }
      setIsFetching(true)
      if(socketNeed) {
        let socket = io(socketDomain)
        socket.emit('login', user)
        socket.on('login', () => {
          setUser(user)
          setSocket(socket)
          set('main')
        })
      } else {
        setUser(user)
        set('main')
      }
    }
    
    useEffect(() => {
      if(!once) return
      let userId = localStorage.getItem('userId')
      if(userId){
        setIsFetching(true)
        fetch(`/getUser/type/id/value/${userId}`).then(res => res.json()).then((res:{res:IUser}) => {
          setIsFetching(false)
          if(res.res){
            tryLogin(res.res)
          }
        })
      }
    }, [once])

    const login = async () => {
        if(!username) return setError('enter username')
        if(!password) return setError('enter password')
        if(isFetching) return
        setIsFetching(true)
        fetch(`/getUser/type/username/value/${username}`).then(res => res.json()).then((res:{res:IUser}) => {
          setIsFetching(false)
          if(res.res){
            if(res.res.password === sha256(password)){
              localStorage.setItem('userId', res.res.id)
              tryLogin(res.res)
            }else{
              setError('invalid password')
            }
          }else{
              setError('invalid username')
          }
        })
    }

    const register = () => {
      if(!username) return setError('enter username')
      if(!password) return setError('enter password')
      if(!confirmPassword) return setError('confirm password')
      if(!checkNick(username)) return setError('username must be 3~12 characters long including numbers and alphabets')
      if(!checkPass(password)) return setError('password must be more than 8 characters long including numbers and alphabets')
      if(password !== confirmPassword) return setError('passwords do not match')
      if(isFetching) return
      setIsFetching(true)
      fetch(`/createUser/username/${username}/password/${password}`).then(res => {
        return res.json()
      }).then((res:{res:IUser}) => {
        if(res.res){
          localStorage.setItem('userId', res.res.id)
          tryLogin(res.res)
        } else {
          setError('name already exists')
          setIsFetching(false)
        }
      })
    }

    return (<>
        {
            <div className="cover flex-col space-y-5" style={{backgroundImage:'url(assets/loginbg.png)'}}>
                <input className="text-sm lg:text-md" disabled={isFetching} style={{opacity:isFetching ? 0.5 : 1}} type="text" name="" id="" placeholder={lng(lang, 'username')} value={username} onChange={e => {setError('');setUsername(e.target.value)}}/>
                <input className="text-sm lg:text-md" disabled={isFetching} style={{opacity:isFetching ? 0.5 : 1}} type="password" name="" id="" placeholder={lng(lang, 'password')} value={password} onChange={e => {setError('');setPassword(e.target.value)}}/>
                {state === 'register' && <input className="text-sm lg:text-md" type="password" name="" id="" disabled={isFetching} style={{opacity:isFetching ? 0.5 : 1}}
                placeholder={lng(lang, 'confirm password')} value={confirmPassword} onChange={e => {setError('');setConfirmPassword(e.target.value)}}/> }
                <button className="text-sm lg:text-md" disabled={isFetching} style={{opacity:isFetching ? 0.5 : 1}} onClick={e => {
                    if (state === 'login') login()
                    else register()
                }}>{lng(lang, state)}</button>
                {error && <div className="text-red-400 text-sm lg:text-md">{lng(lang, error)}</div>}
                <div className="text-white underline cursor-pointer text-sm lg:text-md" onClick={e => setState(opposite(state))}>{lng(lang, `to ${opposite(state)}`)}</div>
            </div>
        }
    </>)
}

export default Login