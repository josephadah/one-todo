const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo.model');

const todos = [
    {_id: new ObjectID(), text: 'First todo for test'},
    {_id: new ObjectID(), text: 'Second todo for test', completed: true, completedAt: 123}
];

beforeEach(done => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos)
        .then(() => done());
    });
});

describe('POST todo api tests', () => {
    it('Should save todo to db with right data', (done) => {
        const text = 'Eat lunch';

        request(app)
            .post('/api/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text)
            })
            .end((er, res) => {
                if (er) {
                    return done(er);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(e => done(e));
            });
    });

    it('Should not save todo with bad request', (done) => {
        request(app)
            .post('/api/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch(e => done(e));
            });
    });
});

describe('GET todos tests', () => {
    it('Should get all todos', (done) => {
        request(app)
            .get('/api/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/id', () => {
    it('Should get a todo by id', (done) => {
        request(app)
            .get(`/api/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(todos[0].text)
            })
            .end(done);
    });

    it('Should return 404 if todo not found', (done) => {
        request(app)
            .get(`/api/todos/${new ObjectID()}`)
            .expect(404)
            .end(done);
    });

    it('Should return 404 for non object ids', (done) => {
        request(app)
            .get(`/api/todos/123`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/id', () => {
    it('Should delete a todo by id', (done) => {
        const hexID = todos[0]._id.toHexString();

        request(app)
            .delete(`/api/todos/${hexID}`)
            .expect(200)
            .expect(res => {
                expect(res.text).toBe(`Successfully removed todo: ${todos[0].text}`)
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexID).then((todo) => {
                    expect(todo).toBeNull();
                    done();
                }).catch(e => done(e));
            });
    });

    it('Should return 404 for id not found', (done) => {
        const hexID = new ObjectID();

        request(app)
            .delete(`/api/todos/${hexID}`)
            .expect(404)
            .end(done);
    });

    it('Should return 404 for invalid id', (done) => {
        request(app)
            .delete(`/api/todos/${123}`)
            .expect(404)
            .end(done);
    });
});

describe('UPDATE /todos', () => {
    it('Should update todo', (done) => {
        request(app)
            .patch(`/api/todos/${todos[0]._id}`)
            .send({text: 'updated text', completed: true})
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe('updated text');
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeTruthy();
            })
            .end(done);
    });

    // TODO: check why text is using first todo
    it('Should clear completedAt when completed is false', (done) => {
        request(app)
            .patch(`/api/todos/${todos[1]._id}`)
            .send({text: 'updated todo', completed: false})
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).toBeFalsy();
                expect(res.body.todo.completedAt).toBeNull();
                expect(res.body.todo.text).toBe('updated todo');
            })
            .end(done);
    })
});