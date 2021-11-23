import log from './log.js'

export async function query(db, sql) {
	//log(sql)
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
	//log(sql)
	return await query(db, sql)
}

export async function regenerarBD(db){

	var consulta = 'DROP TABLE heroku_466c304cf70709d.biblioteca; '
	consulta += 'DROP TABLE heroku_466c304cf70709d.localidad; '
	consulta += 'DROP TABLE heroku_466c304cf70709d.provincia; '
	consulta += 'CREATE TABLE heroku_466c304cf70709d.provincia (codigo INT, nombre VARCHAR(100) NOT NULL, PRIMARY KEY(codigo)); '
	consulta += 'CREATE TABLE heroku_466c304cf70709d.localidad (codigo INT, nombre VARCHAR(100) NOT NULL, codigoProvincia INT NOT NULL, PRIMARY KEY(codigo), FOREIGN KEY (codigoProvincia) REFERENCES provincia (codigo)); '
	consulta += 'CREATE TABLE heroku_466c304cf70709d.biblioteca ( nombre VARCHAR(200), tipo VARCHAR(200) NOT NULL, direccion VARCHAR(200) NOT NULL, codigoPostal INT NOT NULL, codigoLocalidad INT NOT NULL, longitud DOUBLE NOT NULL, latitud DOUBLE NOT NULL, telefono INT, email VARCHAR(100) NOT NULL, descripcion VARCHAR(500), PRIMARY KEY(nombre), FOREIGN KEY (codigoPostal) REFERENCES localidad (codigo)); '
	log(consulta)
	return new Promise(resolve => {
		db.query(consulta, (err, result) => {
			if (err) {
				console.log(err)
				resolve(-1)
			}
			resolve(result)
		})
	})
}