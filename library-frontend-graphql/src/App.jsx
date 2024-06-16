import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Recommended from './components/Recommended'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useBookAdded from './hooks/useBookAdded'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(() =>
    localStorage.getItem('library-app-user')
  )
  const client = useBookAdded()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <ToastContainer />
      <div>
        <button onClick={() => setPage('authors')}>Authors</button>
        <button onClick={() => setPage('books')}>Books</button>
        {!token ? (
          <button onClick={() => setPage('login')}>Login</button>
        ) : (
          <>
            <button onClick={() => setPage('add')}>Add book</button>
            <button onClick={() => setPage('recommended')}>Recommended</button>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>

      <Authors show={page === 'authors'} token={token} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <Login show={page === 'login'} setToken={setToken} setPage={setPage} />

      <Recommended show={page === 'recommended'} />
    </div>
  )
}
export default App
