require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

require('./db/mongoose');
const {Todo} = require('./models/todo.model');
const {User} = require('./models/user.model');

const port = process.env.PORT;

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

        res.send(todo);
    }, err => res.status(500).send());
});

app.patch('/api/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    const body = _.pick(req.body, ["text", "completed"]);

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completedAt = null;
        body.completed = false;
    }

    Todo.findOneAndUpdate(id, {$set: body}, {new: true})
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }

            res.send({todo});
        }).catch(e => res.status(400));

});

app.delete('/api/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findByIdAndDelete(id).then(doc => {
        if (!doc) {
            return res.status(404).send();
        }

        res.status(200).send(`Successfully removed todo: ${doc.text}`);
    }, err => res.status(400).send());
});

app.post('/api/users', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);

    const newUser = new User(body);

    newUser.save().then(() => {
        return newUser.generateAuthToken();
    })
    .then((token) => {
        res.header('x-auth', token).send(newUser);
    })
    .catch(e => res.status(400).send(e));
})

app.listen(port, () => console.log(`Server running on port ${port} ...`));

module.exports = {app};
