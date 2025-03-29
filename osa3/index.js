const express = require('express');
const morgan = require('morgan')
const mongoose = require('mongoose')
const app = express();
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
}

morgan.token('body', (req) => {
  if(req.body) {
    return JSON.stringify(req.body);
  }
  return '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

//db
////////////////////////////////////////////////////////////////////////////////////////
const url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(() => console.log("Connected to the database"))
  .catch(error => console.log("Error connectin to the database: ", error));

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)
///////////////////////////////////////////////////////////////////////////////////////

let persons = [
  { id: 1, 
    name: "Arto Hellas", 
    number: "040-123456" },
  { id: 2, 
    name: "Ada Lovelace", 
    number: "39-44-5323523" },
  { id: 3, 
    name: "Dan Abramov", 
    number: "12-43-234345" },
  { id: 4, 
    name: "Mary Poppendieck", 
    number: "39-23-6423122" }
];

app.get('/info', async (req, res) => {
  const count = await Person.countDocuments();
  const date = new Date();
  res.send(`
    <h1>Phonebook</h1>
    <p>Phonebook has info for ${count} people</p>
    <p>${date}</p>
  `)
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  })
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person=> {
      if (person) {
        res.json(person);
      } else {
        res.status(404).send({error: "Person not found"});
      }
    })
    .catch(error => next(error)); 
});

app.post('/api/persons', async (req, res) => {
  const {name, number} = req.body;

  if (!name || !number) {
    return res.status(400).json({error: "Name or number missing"});
  }

  const existingPerson = await Person.findOne({name});
  if (existingPerson) {
    return res.status(400).json({error: "Name must be unique"});
  }

  const person = new Person({ name, number });

  person.save()
    .then(savedPerson => res.status(201).json(savedPerson))
    .catch(error => res.status(500).json({error: error.message}));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(person => {
      if (person) {
        return res.status(204).end();
      } else {
        return res.status(404).json({error: "Person not found"});
      }
    })
    .catch(error => next(error));
});

app.use((error, req, res, next) => {
  console.error(error.message);
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Malformatted ID' });
  }
  next(error);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
