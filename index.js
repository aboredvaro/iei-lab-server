const PORT = process.env.PORT || 3000
const app = express()
import process from 'process'
import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import mysql from 'mysql'

import log from './utils/log.js'
import * as query from './utils/query.js'
import * as utilities from './utils/utilities.js'

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
	acquireTimeout: 10000
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

app.get('/api/vaciarBD', (req, res) => {
	query.regenerarBD(db).then(response => {
		//log(response)
		res.send(response)
	})
})

app.get('/api/poblarBD', (req, res) => {
	query.poblarBD(db).then(response => {
		//log(response)
		res.send(response)
	})
})

app.get('/api/buscarCoordenadasGPS', (req, res) => {
	utilities.buscarCoordenadasGPS().then(response => {
		//log(response)
		res.send(response)
	})
})

app.get('/api/cargaAlmacenDatos', (req, res) => {
	let lightOrHeavy = utilities.getNumber(req.query.lh)
	let valencia = utilities.getNumber(req.query.v)
	let euskadi = utilities.getNumber(req.query.e)
	let catalunya = utilities.getNumber(req.query.c)

	if (lightOrHeavy < 0 || lightOrHeavy > 1) {
		return res.send('❌ ¡El fichero fuente elegido no está disponible!')
	} else if (valencia < 0 || valencia > 1) {
		return res.send('❌ ¡El valor para "VALENCIA" no es el adecuado!')
	} else if (euskadi < 0 || euskadi > 1) {
		return res.send('❌ ¡El valor para "EUSKADI" no es el adecuado!')
	} else if (catalunya < 0 || catalunya > 1) {
		return res.send('❌ ¡El valor para "CATALUNYA" no es el adecuado!')
	} else if (valencia === 0 && euskadi === 0 && catalunya === 0 ){
		return res.send('❌ ¡No ha seleccionado ninguna comunidad!')
	}

	query.cargaAlmacenDatos(db, lightOrHeavy, valencia, euskadi, catalunya).then(response => {
		//log(response)
		res.send(response)
	})
})

app.get('/api/cargaBuscador', (req, res) => {
	query.cargaBuscador(db, req).then(response => {
		//log(response)
		res.send(response)
	})
})

app.get('/api/cargaLocalidad', (req, res) => {
	query.cargaLocalidad(db, req).then(response => {
		//log(response)
		res.send(response)
	})
})

app.get('/api/cargaCodigoPostal', (req, res) => {
	query.cargaCodigoPostal(db, req).then(response => {
		//log(response)
		res.send(response)
	})
})

app.get('/api/cargaProvincia', (req, res) => {
	query.cargaProvincia(db, req).then(response => {
		//log(response)
		res.send(response)
	})
})

app.get('/api/cargaTipo', (req, res) => {
	query.cargaTipo(db, req).then(response => {
		//log(response)
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
