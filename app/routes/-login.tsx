import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { lng } from "~/data/lang";
import { checkNick, checkPass, sha256 } from "~/data/utils";

const opposite = (state:string) => state === 'login' ? 'register' : 'login'

const socketDomain = process.env.NODE_ENV === 'production' ? 'https://lvlzero.onrender.com' : 'http://127.0.0.1:3002'

const Login:FC<glFCProps> = ({lang, set, setUser, setSocket}) => {
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
      let socket = io(socketDomain)
      socket.on('connect', () => {
        setUser(user)
        setSocket(socket)
        set('main')
      })
    }

    useEffect(() => {
      if(!once) return
      let userId = localStorage.getItem('userId')
      if(userId){
        setIsFetching(true)
        fetch(`/getUser/type/id/value/${userId}`).then(res => res.json()).then((res:{res:IUser}) => {
          if(res.res){
            tryLogin(res.res)
          }
        })
      }
    }, [once])

    const login = async () => {
        if(!username) return setError(lng(lang, 'enter username'))
        if(!password) return setError(lng(lang, 'enter password'))
        if(isFetching) return
        setIsFetching(true)
        fetch(`/getUser/type/username/value/${username}`).then(res => res.json()).then((res:{res:IUser}) => {
            if(res.res){
              if(res.res.password === sha256(password)){
                localStorage.setItem('userId', res.res.id)
                tryLogin(res.res)
              }else{
                setIsFetching(false)
                setError(lng(lang, 'invalid password'))
              }
            }else{
                setIsFetching(false)
                setError(lng(lang, 'invalid username'))
            }
        })
    }

    const register = () => {
      if(!username) return setError(lng(lang, 'enter username'))
      if(!password) return setError(lng(lang, 'enter password'))
      if(!confirmPassword) return setError(lng(lang, 'confirm password'))
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
          setError(lng(lang, 'name already exists'))
          setIsFetching(false)
        }
      })
    }

    return (<>
        {
            <div className="cover flex-col space-y-5" style={{backgroundImage:'url(assets/loginbg.png)'}}>
                <input type="text" name="" id="" placeholder={lng(lang, 'username')} value={username} onChange={e => {setError('');setUsername(e.target.value)}}/>
                <input type="password" name="" id="" placeholder={lng(lang, 'password')} value={password} onChange={e => {setError('');setPassword(e.target.value)}}/>
                {state === 'register' && <input type="password" name="" id=""
                placeholder={lng(lang, 'confirm password')} value={confirmPassword} onChange={e => {setError('');setConfirmPassword(e.target.value)}}/> }
                <button disabled={isFetching} style={{opacity:isFetching ? 0.5 : 1}} onClick={e => {
                    if (state === 'login') login()
                    else register()
                }}>{lng(lang, state)}</button>
                {error && <div className="text-red-400">{lng(lang, error)}</div>}
                <div className="text-white underline cursor-pointer" onClick={e => setState(opposite(state))}>{lng(lang, `to ${opposite(state)}`)}</div>
            </div>
        }
    </>)
}

export default Login