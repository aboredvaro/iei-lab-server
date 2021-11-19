const PORT = process.env.PORT || 3000
const app = express()
import process from 'process'
import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import mysql from 'mysql'

import log from './utils/log.js'
import * as euskadi from './utils/euskadi.js'
import * as catalunya from './utils/catalunya.js'

app.use(cors())
app.use(express.json())

//  //  //  //  //
//
//  DB CONNECTION
//
//  //  //  //  //

const db_config = {
	user: process.env.REACT_APP_DB_USER,
	host: process.env.REACT_APP_DB_HOST,
	password: process.env.REACT_APP_DB_PASSWORD,
	database: process.env.REACT_APP_DB_NAME,
	connectionLimit : 100,
	acquireTimeout: 5000
}

const db = mysql.createPool(db_config)

db.getConnection((err, connection) => {

	if (err) {
		if (err.code == 'PROTOCOL_CONNECTION_LOST') {
			log('👋🏻 DB Connection was closed')
		}

		if (err.code == 'ERR_CON_COUNT_ERROR') {
			log('⚠️ DB has too many connections')
		}
		
		if (err.code == 'ECONNREFUSED') {
			log('⛔️ DB Connection was refused')
		}
	}   

	if (connection) {
		connection.release()
	}
	log('✅ Connected to DB')
	return
})

//  //  //  //  //
//
//  API REST
//
//  //  //  //  //

// SERVER STATUS DEBUG
app.get('/', (req, res) => {
	res.send('✅ IEI server is online')
})

// ENV DEBUG API
app.get('/env', (req, res) => {
	res.send(process.env.NODE_ENV === 'dev' ? 'dev' : 'prod')
})

//  //  //  //  //
//
//  API TRANSFORMATION
//
//  //  //  //  //

// ===========================> TRANSFORMATION HERE <===========================

app.get('/api/xml', (req, res) => {
	//log(req.body)
	catalunya.insertXML(db).then(response => {
		res.send(response)
	})
})

app.get('/api/json', (req, res) => {
	//log(req)
	euskadi.insertJSON(db).then(response => {
		res.send(response)
	})
})

//  //  //  //  //
//
//  START LISTENING
//
//  //  //  //  //

app.listen(PORT, () => {
	log('\nServer is up and running at port ' + PORT)
})
