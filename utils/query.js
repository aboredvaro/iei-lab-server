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
	var consulta = 'DROP TABLE IF EXISTS biblioteca; '
	consulta += 'DROP TABLE IF EXISTS localidad; '
	consulta += 'DROP TABLE IF EXISTS provincia; '
	consulta += 'CREATE TABLE provincia (codigo INT, nombre VARCHAR(100) NOT NULL, PRIMARY KEY(codigo)); \n'
	consulta += 'CREATE TABLE localidad (codigo INT, nombre VARCHAR(100) NOT NULL, codigoProvincia INT NOT NULL, PRIMARY KEY(codigo), FOREIGN KEY (codigoProvincia) REFERENCES provincia (codigo)); \n'
	consulta += 'CREATE TABLE biblioteca ( nombre VARCHAR(200), tipo VARCHAR(200) NOT NULL, direccion VARCHAR(200) NOT NULL, codigoPostal INT NOT NULL, codigoLocalidad INT NOT NULL, longitud DOUBLE NOT NULL, latitud DOUBLE NOT NULL, telefono INT, email VARCHAR(100) NOT NULL, descripcion VARCHAR(500), PRIMARY KEY(nombre), FOREIGN KEY (codigoPostal) REFERENCES localidad (codigo)); \n'
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