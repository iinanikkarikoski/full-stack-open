/*require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const config = require('./utils/config')
const app = express()
app.use(express.json())*/

const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

const PORT = config.PORT
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

/*if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'))
}

morgan.token('body', (req) => {
  if(req.body) {
    return JSON.stringify(req.body)
  }
  return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))*/

////////////////////////////////////////////////////////////////////////////////////////
/*const url = config.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(() => console.log('Connected to the database'))
  .catch(error => console.log('Error connectin to the database: ', error))*/

/*const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  blogUrl: String,
  likes: Number,
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Blog = mongoose.model('Blog', blogSchema)*/
////////////////////////////////////////////////////////////////////////////////////////

/*app.get('/api/blogs', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog.save().then((result) => {
    response.status(201).json(result)
  })
})*/


