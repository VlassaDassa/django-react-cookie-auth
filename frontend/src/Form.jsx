import React, { useState, useEffect } from "react";
import axios from 'axios';

import style from './index.module.scss';



const serverUrl = 'http://localhost:8000/'

const Form = () => {
    const [isCsrf, setIsCsrf] = useState(null)
    const [isLogin, setIsLogin] = useState('')
    const [isPassword, setIsPassword] = useState('')
    const [isError, setIsError] = useState(null)
    const [isAuth, setIsAuth] = useState(false)
    const [username, setUsername] = useState('')
    const [userId, setUserId] = useState(null)

    useEffect(() => {
        getSession()
    }, [])

    const isResponseOk = (res) => {
      if (!(res.status >= 200 && res.status <= 299)) {
        throw Error(res.statusText);
      }
    }

    const getCSRF = () => {
        axios.get(serverUrl + 'api/csrf/', { withCredentials: true })
        .then((res) => {
            isResponseOk(res)

            const csrfToken = res.headers.get('X-CSRFToken')
            setIsCsrf(csrfToken)
        })
        .catch((err) => console.error(err))
    }

    const getSession = () => {
      axios.get(serverUrl + "api/session/", { withCredentials: true })
      .then((res) => {
          if (res.data.isAuthenticated) {
              setUserId(res.data.user_id)
              setUsername(res.data.username)
              setIsAuth(true)
              return
          }

          setIsAuth(false)
          getCSRF()
      })
      .catch(err => console.error(err))
    }

    const login = () => {
      const data = { username: isLogin, password: isPassword }
      axios.post(serverUrl + "api/login/", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": isCsrf,
        }
      })
      .then((res) => {
        isResponseOk(res)
        setIsAuth(true)
        setIsLogin('')
        setIsPassword('')
        setIsError(null)
        
        userInfo()
      })
      .catch((err) => {
        console.error(err);
        setIsError("Неверные данные")
      });
    }

    const logout = () => {
      axios.get(serverUrl + "api/logout", { withCredentials: true })
      .then((res) => {
        isResponseOk(res)
        setIsAuth(false);
        getCSRF();
      })
      .catch(err => console.error(err));
    }

    const userInfo = () => {
      axios.get(serverUrl + "api/user_info/", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        console.log("Вы авторизованы как: " + res.data.username);
        setUsername(res.data.username)
      })
      .catch((err) => {
          if (err.status === 401) console.log(err.error);
      });
    }

    const killAllSessions = () => {
      axios.get(serverUrl + "api/kill_all_sessions/", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        isResponseOk(res)
        console.log(res.data.detail)
      })
      .catch((err) => {
        console.log(err);
      });
    }

    function changePassword(e) {
        setIsPassword(e.target.value)
    }

    function changeLogin(e) {
        setIsLogin(e.target.value)
    }

    function submitForm(e) {
        e.preventDefault()

        login()
    }


    return(
      <div className={style.container}>
          <div className={style.authStatus}>
            Вы - 
            <span className={style.username}>
            {
              isAuth ? ' ' + username   : ' неавторизованы' 
            }
            </span>
          </div>

          {
            !isAuth ?
              <form className={style.formContainer}>
                  <label htmlFor="login">Логин</label>
                  <input 
                      type="text" 
                      name="login" 
                      id="login" 
                      className={style.field}
                      onChange={changeLogin}
                      value={isLogin}
                  />

                  <label htmlFor="password">Пароль</label>
                  <input 
                      type="password" 
                      name="password" 
                      id="password" 
                      className={style.field} 
                      onChange={changePassword}
                      value={isPassword}
                  />

                  {
                      isError ? <div className={style.error}>{isError}</div> : null
                  }

                  <input type="submit" value='Войти' onClick={submitForm} className={style.sendBtn} />
              </form>
            :

              <div className={style.btnContainer}>
                  <input type="submit" value='Выйти' onClick={logout} className={style.logoutBtn} />
                  <input type="submit" value='Убить все сессии' onClick={killAllSessions} className={style.killAllSessionsBtn} />
              </div>
                  
          }
          
      </div>
    )


}


export default Form;