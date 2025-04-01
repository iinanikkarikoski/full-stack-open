const mongoose = require('mongoose')

/*if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}*/

//const password = process.argv[2]
const title = process.argv[2]
const author = process.argv[3]
const blogUrl = process.argv[4]
const likes = process.argv[5]

const url = 'mongodb+srv://Kissa:Kissa22@cluster0.geslcnv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.set('strictQuery', false)
mongoose.connect(url)

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  blogUrl: String,
  likes: Number,
})

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  password: String,
})

const Blog = mongoose.model('Blog', blogSchema)

if (title && author && blogUrl && likes) {
  const blog = new Blog({
    title,
    author,
    blogUrl,
    likes,
  })

  blog.save().then(() => {
    console.log(`Added blog post ${title} to the list`)
    mongoose.connection.close()
  })
} else {
  Blog.find({}).then(result => {
    console.log('Blog')
    result.forEach(blog => {
      console.log(`${blog.title} ${blog.author}`)
    })
    mongoose.connection.close()
  })
}
