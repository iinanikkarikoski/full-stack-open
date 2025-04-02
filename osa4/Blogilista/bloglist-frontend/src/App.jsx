import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import './App.css'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [blogUrl, setBlogUrl] = useState('');
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationType, setNotificationType] = useState('success')

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const addBlog = async (event) => {
    event.preventDefault();
    const newBlog = {
      title,
      author,
      blogUrl,
    };
  
    try {
      const savedBlog = await blogService.create(newBlog);
      setBlogs(blogs.concat(savedBlog));
      setTitle('');
      setAuthor('');
      setBlogUrl('');
      setNotificationMessage(`A new blog post ${savedBlog.title} by ${savedBlog.author} added`)
      setNotificationType('success')
      setTimeout(() => setNotificationMessage(null), 5000)
    } catch (error) {
      console.error('Error creating blog:', error);
      setNotificationMessage(`Failed to add blog ${savedBlog.title}`)
      setNotificationType('error')
      setTimeout(() => setNotificationMessage(null), 5000)
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault()
    console.log('logging in with', username, password)

    try {
      const user = await loginService.login({
        username, password,
      })
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      ) 
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setNotificationMessage(`Wrong username or password!`)
      setNotificationType('error')
      setTimeout(() => setNotificationMessage(null), 5000)
    }
  }

  const NotificationMessage = ({message, type = 'success'}) => {
    if (message === null) {
        return null
    }
  
    return (
        <div className={type}>
            {message}
        </div>
    )
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
          <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
          <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>      
  )

  const blogForm = () => (
    <div>
      <h2>Create new blog post:</h2>
      <form onSubmit={addBlog}>
        <div>
          Title:
            <input
            type="text"
            value={title}
            name="Title"
            onChange={({ target }) => setTitle(target.value)}
            />
        </div>
        <div>
          Author:
            <input
            type="text"
            value={author}
            name="Author"
            onChange={({ target }) => setAuthor(target.value)}
            />
        </div>
        <div>
          Blog URL:
            <input
            type="text"
            value={blogUrl}
            name="BlogUrl"
            onChange={({ target }) => setBlogUrl(target.value)}
            />
        </div>
        <button type="submit">save</button>
      </form>
    </div>
  )

  return (
    <div>
      <h2>Login</h2>
      <NotificationMessage message={notificationMessage} type={notificationType} />
      {!user && loginForm()}
      {user && <div>
        <p>{user.name} logged in
          <button onClick={() => {
            window.localStorage.removeItem('loggedBlogappUser')
            setUser(null) 
          }}>
            Logout
          </button>
        </p>
          {blogForm()}
        </div>
      } 

      <h2>Blogs</h2>
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}
    </div>
  )
}

export default App