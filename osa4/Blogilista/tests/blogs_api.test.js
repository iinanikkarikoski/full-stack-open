const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const app = require('../app')
const Blog = require('../models/blog')
const config = require('../utils/config')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

let blogToUpdate = null

beforeEach(async () => {
    // Connecting to test database
    const mongoUrl = config.MONGODB_URI
    try {
        await mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }

    await Blog.deleteMany({})
    console.log('Adding test blogs...')
    // Adding testblogs
    const blog1 = new Blog({
        title: "React patterns",
        author: "Michael Chan",
        blogUrl: "https://reactpatterns.com/",
        likes: 7,
    })
    const blog2 = new Blog({
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        blogUrl: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
    })
    const blog3 = new Blog({
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        blogUrl: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
    })
    const blog4 = new Blog({
        title: "First class tests",
        author: "Robert C. Martin",
        blogUrl: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
    })

    await blog1.save()
    await blog2.save()
    await blog3.save()
    await blog4.save()

    blogToUpdate = blog4


    ////users
    await User.deleteMany({})
      
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
      
    await user.save()
})

test('GET /api/blogs returns correct number of blogs', async () => {
    const response= await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    assert(Array.isArray(response.body), 'Response body is not an array')
    assert.strictEqual(response.body.length, 4, `Expected 4 blogs but got ${response.body.length}`)
})

test('GET /api/blogs returns blogs with id field', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    response.body.forEach(blog => {
      assert.ok(blog.id, 'Blog does not have an id field')
    })
})

test('POST /api/blogs adding a new blog', async () => {
    const currentBlogs = await Blog.find({})
    const currentBlogNumber = currentBlogs.length

    const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        blogUrl: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

      const updatedBlogs = await Blog.find({})
      assert.strictEqual(updatedBlogs.length, currentBlogNumber + 1, `Expected blog count to increase by 1`)

      const addedBlog = updatedBlogs.find(blog => blog.id === response.body.id)
      assert.ok(addedBlog, 'Added blog not found in database')
      assert.strictEqual(addedBlog.title, newBlog.title, `Expected title to be ${newBlog.title}`)
      assert.strictEqual(addedBlog.author, newBlog.author, `Expected author to be ${newBlog.author}`)
      assert.strictEqual(addedBlog.url, newBlog.url, `Expected url to be ${newBlog.url}`)
      assert.strictEqual(addedBlog.likes, newBlog.likes, `Expected likes to be ${newBlog.likes}`)
})

test('POST /api/blogs without likes sets likes to 0', async () => {
    const newBlog = {
        title: "No likes",
        author: "Author 1",
        blogUrl: "http://test.com",
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    assert.strictEqual(response.body.likes, 0, 'Expected likes to be 0')
})

test('POST /api/blogs without title or url returns 400', async () => {

    const WithoutTitle = {
        author: "Kissa",
        blogUrl: "http://testurli.com",
    }

    const WithoutUrl = {
        title: "Test Blog without URL",
        author: "Koira",
    }

    let response = await api
      .post('/api/blogs')
      .send(WithoutTitle)
      .expect(400)


    response = await api
      .post('/api/blogs')
      .send(WithoutUrl)
      .expect(400)
})

test('DELETE /api/blogs/:id removes a blog', async () => {
    const currentBlogs = await Blog.find({})
    const currentBlogNumber = currentBlogs.length

    const blogToDelete = currentBlogs[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const updatedBlogs = await Blog.find({})
    assert.strictEqual(updatedBlogs.length, currentBlogNumber - 1, `Expected blog count to decrease by 1`)
})

test('DELETE /api/blogs/:id for a non-existent blog returns 404', async () => {
    const fakeId = new mongoose.Types.ObjectId()

    await api
      .delete(`/api/blogs/${fakeId}`)
      .expect(404)
})

test('PUT /api/blogs/:id updates likes correctly', async () => {
    const updatedLikes = {likes: 20}
    console.log(blogToUpdate.id)

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedLikes)
      .expect(200)

    assert.strictEqual(response.body.likes, updatedLikes.likes, 'Likes count should be updated')

    const updatedBlog = await Blog.findById(blogToUpdate.id)
    assert.strictEqual(updatedBlog.likes, updatedLikes.likes, 'Database should reflect updated likes')
})

test('PUT /api/blogs/:id for a non-existent blog returns 404', async () => {
    const fakeId = new mongoose.Types.ObjectId()

    await api
      .put(`/api/blogs/${fakeId}`)
      .send({likes: 10})
      .expect(404)
})


//////////////////////////  USERS  /////////////////////////////////////////////////////
test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()
  
    const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
    }
  
    const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    console.log('Response body:', response.body)
    
    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
  
    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
})

test('user creation fails if username is too short', async () => {

    const newUser = {
        username: 'ab',
        name: 'Short Name',
        password: 'mypassword',
    }

    const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    assert.strictEqual(response.body.error, 'Username and password have to be at least 3 characters.')

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, 1)
})

test('user creation fails if password is too short', async () => {

    const newUser = {
        username: 'validname',
        name: 'Valid User',
        password: 'pw',
    }

    const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    assert.strictEqual(response.body.error, 'Username and password have to be at least 3 characters.')

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, 1)
})

test('user creation fails if username is already taken', async () => {

    const user1 = {
        username: 'duplicateuser',
        name: 'First User',
        password: 'password123',
    }

    await api.post('/api/users').send(user1).expect(201)

    const user2 = {
        username: 'duplicateuser',
        name: 'Second User',
        password: 'anotherpassword',
    }

    const response = await api.post('/api/users').send(user2).expect(400)

    assert.strictEqual(response.body.error, 'Username has to be unique.')

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, 2)
})


after(async () => {
  await mongoose.connection.close()
})

