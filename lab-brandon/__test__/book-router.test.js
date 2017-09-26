'use strict'

// mock env
process.env.PORT = 7000
process.env.MONGODB_URI = 'mongodb://localhost/testing'

const faker = require('faker')
const superagent = require('superagent')
const Book = require('../model/bookbought.js')
const server = require('../lib/server.js')

const apiURL = `http://localhost:${process.env.PORT}`;

const bookMockCreate = () => {
  return new Book({
    title: faker.lorem.words(10),
    content: faker.lorem.words(100),
  }).save()
}

describe('/api/books', () => {
  beforeAll(server.start)
  afterAll(server.stop)
  afterEach(() => Book.remove({}))

  describe('POST /api/books', () => {
    test('should respond with a note and 200 status', () => {
      let tempBook = {
        title: faker.lorem.words(10),
        author: faker.lorem.words(8),
        content: faker.lorem.words(100),
      }
      return superagent.post(`${apiURL}/api/books`)
      .send(tempBook)
      .then(res => {
        expect(res.status).toEqual(200)
        console.log('res.body', res.body)
        expect(res.body._id).toBeTruthy()
        expect(res.body.timestamp).toBeTruthy()
        expect(res.body.title).toEqual(tempBook.title)
        expect(res.body.author).toEqual(tempBook.author)
        expect(res.body.content).toEqual(tempBook.content)
      })
    })

    test('should respond with a 400 status', () => {
      let mockBook = {
        content: faker.lorem.words(100),
      }
      return superagent.post(`${apiURL}/api/books`)
      .send(mockBook)
      .then(Promise.reject)
      .catch(res => {
        expect(res.status).toEqual(400)
      })
    })
  })

  describe('GET /api/books', () => {
    test('should respond with a note and 200 status', () => {
      let tempBook
      return bookMockCreate()
      .then(note => {
        tempBook = note
        return superagent.get(`${apiURL}/api/books/${note._id}`)
      })
      .then(res => {
        expect(res.status).toEqual(200)
        expect(res.body._id).toEqual(tempBook._id.toString())
        expect(res.body.timestamp).toBeTruthy()
        expect(res.body.title).toEqual(tempBook.title)
        expect(res.body.author).toEqual(tempBook.author)
        expect(res.body.content).toEqual(tempBook.content)
      })
    })

    test('should respond with 404 status', () => {
      return superagent.get(`${apiURL}/api/books/lilwayne`)
      .then(Promise.reject)
      .catch(res => {
        expect(res.status).toEqual(404)
      })
    })
  })
})
