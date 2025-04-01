const blogsRouter = require('express').Router()
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
      .find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs) 
})

blogsRouter.post('/', async (request, response) => {
  const { title, blogUrl, author, likes, user } = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const userID = await User.findById(decodedToken.id)

  if (!userID) {
    return response.status(400).json({ error: 'User not found' });
  }

  if (!title || !blogUrl) {
    return response.status(400).json({ error: 'Title and URL are required' })
  }

  const blog = new Blog({
    title,
    author,
    blogUrl,
    likes: likes || 0,
    user: userID.id, 
  })

  try {
    const savedBlog = await blog.save()
    userID.blogs = userID.blogs.concat(savedBlog.id)
    await userID.save()
    response.status(201).json(savedBlog)
  } catch {
    response.status(500).json({error: 'Something went wrong'})
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' })
  }

  try {
    const blog = await Blog.findByIdAndDelete(request.params.id)
    if (!blog) {
      return response.status(404).json({ error: 'Blog post not found' })
    }
    response.status(204).end()
  } catch (error) {
    response.status(500).json({ error: 'Something went wrong' })
  }

})

// Updating the number of likes
blogsRouter.put('/:id', async (request, response) => {
  const {id} = request.params
  const {likes} = request.body

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {likes},
      {new: true, runValidators: true}
    )

    if (!updatedBlog) {
      return response.status(404).json({ error: 'Blog not found' })
    }
    response.json(updatedBlog)
    
  } catch (error) {
    console.error('Error updating blog:', error)
    response.status(500).json({ error: 'Something went wrong' })
  }
})  

module.exports = blogsRouter
