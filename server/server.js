const express = require('express');
const bodyParser = require('body-parser');

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
    });
});

app.listen(port, () => console.log(`Server running on port ${port} ...`));
