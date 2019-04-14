const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo.model');

describe('POST todo api tests', () => {
    beforeEach(done => {
        Todo.remove({}).then(() => {
            done();
        });
    });

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

                Todo.find().then((todos) => {
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
                    expect(todos.length).toBe(0);
                    done();
                }).catch(e => done(e));
            });
    });
});