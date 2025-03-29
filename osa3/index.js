require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const app = express()
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'))
}

morgan.token('body', (req) => {
  if(req.body) {
    return JSON.stringify(req.body)
  }
  return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

//db
////////////////////////////////////////////////////////////////////////////////////////
const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(() => console.log('Connected to the database'))
  .catch(error => console.log('Error connectin to the database: ', error))

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: String,
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)
///////////////////////////////////////////////////////////////////////////////////////

app.get('/info', async (req, res) => {
  const count = await Person.countDocuments()
  const date = new Date()
  res.send(`
    <h1>Phonebook</h1>
    <p>Phonebook has info for ${count} people</p>
    <p>${date}</p>
  `)
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).send({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', async (req, res, next) => {
  const { name, number } = req.body

  if (!name || !number) {
    return res.status(400).json({ error: 'Name or number missing' })
  }

  const existingPerson = await Person.findOne({ name })
  if (existingPerson) {
    return res.status(400).json({ error: 'Name must be unique' })
  }

  const person = new Person({ name, number })

  person.save()
    .then(savedPerson => res.status(201).json(savedPerson))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findById(req.params.id)
    .then(person => {
      if(!person) {
        return res.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then((updatePerson) => {
        res.json(updatePerson)
      })
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' })
  }

  try {
    const person = await Person.findByIdAndDelete(req.params.id)
    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Malformatted ID' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
