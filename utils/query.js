import log from './log.js'

import * as euskadi from './euskadi.js'
import * as catalunya from './catalunya.js'
import * as valencia from './valencia.js'

export async function query(db, sql) {
	log(sql)
	return new Promise(resolve => {
		db.query(sql, (err, result) => {
			if (err) {
				console.log(err)
				resolve(-1)
			}
			resolve(result)
		})
	})
}

export async function isInDatabase(db, column, fromTables, conditionWhere) {
	var select = 'SELECT COUNT(' + column + ') as cuenta '
	var from = 'FROM ' + fromTables + ' '
	var where = 'WHERE ' + conditionWhere + ';'
	var sql = select + from + where
	log(sql)
	return await query(db, sql)
}

export async function regenerarBD(db){
	//log('Regenerando BD')
	
	var flag = true
	var mensaje = ''
	if ( await dropBiblioteca(db) ) {
		mensaje += '✅ Se ha podido BORRAR la tabla Biblioteca. \n'
	} else {
		//flag = false
		mensaje += '❌ Error al BORRAR tabla Biblioteca. \n'
	}

	if ( await dropLocalidad(db) ) {
		mensaje += '✅ Se ha podido BORRAR la tabla Localidad. \n'
	} else {
		//flag = false
		mensaje += '❌ Error al BORRAR tabla Localidad. \n'
	}

	if ( await dropProvincia(db) ) {
		mensaje += '✅ Se ha podido BORRAR la tabla Provincia. \n'
	} else {
		//flag = false
		mensaje += '❌ Error al BORRAR tabla Provincia. \n'
	}

	if ( await createProvincia(db) ) {
		mensaje += '✅ Se ha podido CREAR la tabla Provincia. \n'
	} else {
		flag = false
		mensaje += '❌ Error al CREAR tabla Provincia. \n'
	}

	if ( await createLocalidad(db) ) {
		mensaje += '✅ Se ha podido CREAR la tabla Localidad. \n'
	} else {
		flag = false
		mensaje += '❌ Error al CREAR tabla Localidad. \n'
	}

	if ( await createBiblioteca(db) ) {
		mensaje += '✅ Se ha podido CREAR la tabla Biblioteca. \n'
	} else {
		flag = false
		mensaje += '❌ Error al CREAR tabla Biblioteca. \n'
	}
	log(mensaje)
	return flag 
}

async function dropBiblioteca(db){
	var consulta = 'DROP TABLE IF EXISTS biblioteca; '
	//log(consulta)
	return new Promise(resolve => {
		db.query(consulta, (err) => {
			if (err) {
				console.log(err)
				resolve(false)
			}
			resolve(true)
		})
	})
}

async function dropProvincia(db){
	var consulta = 'DROP TABLE IF EXISTS provincia; '
	//log(consulta)
	return new Promise(resolve => {
		db.query(consulta, (err) => {
			if (err) {
				console.log(err)
				resolve(false)
			}
			resolve(true)
		})
	})
}

async function dropLocalidad(db){
	var consulta = 'DROP TABLE IF EXISTS localidad; '
	//log(consulta)
	return new Promise(resolve => {
		db.query(consulta, (err) => {
			if (err) {
				console.log(err)
				resolve(false)
			}
			resolve(true)
		})
	})
}

async function createProvincia(db){
	var consulta = 'CREATE TABLE provincia (codigo INT, nombre VARCHAR(100) NOT NULL, PRIMARY KEY(codigo)); '
	//log(consulta)
	return new Promise(resolve => {
		db.query(consulta, (err) => {
			if (err) {
				console.log(err)
				resolve(false)
			}
			resolve(true)
		})
	})
}

async function createLocalidad(db){
	var consulta = 'CREATE TABLE localidad (codigo INT, nombre VARCHAR(100) NOT NULL, codigoProvincia INT NOT NULL, PRIMARY KEY(codigo), FOREIGN KEY (codigoProvincia) REFERENCES provincia (codigo));  '
	//log(consulta)
	return new Promise(resolve => {
		db.query(consulta, (err) => {
			if (err) {
				console.log(err)
				resolve(false)
			}
			resolve(true)
		})
	})
}

async function createBiblioteca(db){
	var consulta = 'CREATE TABLE biblioteca (id INT AUTO_INCREMENT, nombre VARCHAR(500), tipo VARCHAR(500) NOT NULL, direccion VARCHAR(500) NOT NULL, codigoPostal INT NOT NULL, codigoLocalidad INT NOT NULL, longitud DOUBLE, latitud DOUBLE, telefono VARCHAR(100), email VARCHAR(300) NOT NULL, descripcion VARCHAR(1000), PRIMARY KEY(id), FOREIGN KEY (codigoPostal) REFERENCES localidad (codigo)); '
	//log(consulta)
	return new Promise(resolve => {
		db.query(consulta, (err) => {
			if (err) {
				console.log(err)
				resolve(false)
			}
			resolve(true)
		})
	})
}

export async function poblarBD(db){
	log('\n')
	log('_________________________________________')
	log('\n')
	log('\n⏳ Regenerando la BD')
	if ( ! (await regenerarBD(db)) ){
		return '❌ ¡Error al regenerar BD!'
	}

	log('\nInsertar datos de Euskadi')
	if ( ! (await euskadi.insertJSON(db)) ){
		return '❌ ¡Error al insertar datos de Euskadi!'
	}

	log('\nInsertar datos de Catalunya')
	if ( ! (await catalunya.insertXML(db)) ){
		return '❌ ¡Error al insertar datos de Catalunya!'
	}

	log('\nInsertar datos de Valencia')
	if ( ! (await valencia.insertCSV(db)) ){
		return '❌ ¡Error al insertar datos de Valencia!'
	}
	log('\n🎉 LOS DATOS DE TODAS LAS BD SE HAN INSERTADO CON ÉXITO')
	return '🎉 LOS DATOS DE TODAS LAS BD SE HAN INSERTADO CON ÉXITO'

}