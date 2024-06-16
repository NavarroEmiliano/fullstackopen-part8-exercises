import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { LOGIN } from '../queries'

const Login = props => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login, result] = useMutation(LOGIN)

  const submit = e => {
    e.preventDefault()

    login({ variables: { username, password } })
    setUsername('')
    setPassword('')
  }

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      localStorage.setItem('library-app-user', token)
      props.setToken(token)
      props.setPage('authors')
    }
  }, [result.data]) //eslint-disable-line

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          Username{' '}
          <input
            type='text'
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          Password{' '}
          <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>Login</button>
      </form>
    </div>
  )
}

export default Login
