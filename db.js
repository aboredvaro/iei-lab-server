/* eslint-disable no-undef */
import mysql from 'mysql'

const db = mysql.createConnection({
	user: 'bebb80b83fc890',
	host: 'eu-cdbr-west-01.cleardb.com',
	password: 'e9dfcda1',
	database: 'heroku_466c304cf70709d',
})

module.exports = db