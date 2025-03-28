const express = require('express');
const morgan = require('morgan')
const app = express();
app.use(express.json());
const cors = require('cors')
app.use(cors())

morgan.token('body', (req) => {
  if(req.body) {
    return JSON.stringify(req.body);
  }
  return '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

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

app.get('/info', (req, res) => {
  const date = new Date();
  res.send(`
    <h1>Phonebook</h1>
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>
  `)
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(p => p.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).send({error: "Person not found"});
  }
});

app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({error: "Name or number missing"});
  }

  if (persons.some(person => person.name === body.name)) {
    return res.status(400).json({error: "Name must be unique"});
  }

  const newPerson = {
    id: Math.floor(Math.random()* 10000),
    name: body.name,
    number: body.number
  };

  persons.push(newPerson);
  res.status(201).json(newPerson);
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(p => p.id !== id);
  res.status(204).end();
});


const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
