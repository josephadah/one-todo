const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo.model');

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());

app.post('/api/todos', (req, res) => {
    const newTodo = new Todo({
        text: req.body.text
    });

    newTodo.save().then((doc) => {
        res.send(doc);
    }, e => res.status(400).send(e));
});

app.get('/api/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, err => res.status(400).send(err));
});

app.get('/api/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        return res.send(todo);
    }, err => res.status(500).send());

});

app.listen(port, () => console.log(`Server running on port ${port} ...`));

module.exports = {app};
