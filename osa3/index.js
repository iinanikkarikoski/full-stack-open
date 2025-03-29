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
const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://Kissa:${password}@cluster0.geslcnv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

/*if (name && number) {
    const person = new Person({
        name,
        number,
    });

    person.save().then(() => {
        console.log(`Added ${name} number ${number} to phonebook`);
        mongoose.connection.close();
    }); 
} else {
    Person.find({}).then(result => {
        console.log('Phonebook');
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`);
        });
        mongoose.connection.close();
    });
}*/
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

app.get('/info', (req, res) => {
  const date = new Date();
  res.send(`
    <h1>Phonebook</h1>
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>
  `)
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  })
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
