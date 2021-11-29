import fs from 'fs'
import csvtojson from 'csvtojson'

import log from './log.js'
import * as utilities from './utilities.js'
import * as query from './query.js'

export async function insertCSV(db) {

	var parseo = await utilities.csvJSON('./fuente/valencia.csv')

	return parseo
	/*
	var parser = new csvtojson({})
	return new Promise(resolve => {
		fs.readFile('./fuente/valencia.csv', function(err, data) {
			parser.parseString(data, function (err, result) {
				resolve(result)
			})
		})
	}).then(async(json) => {
		log(json)
		//query.regenerarBD(db)
		var resultado = ''
		resultado += await insertarProvinciaInBD(db, json) + ' de Valencia'
		resultado += '\n'
		resultado += await insertLocalidadInBD(db, json) + ' de Valencia'
		resultado += '\n'
		resultado += await insertBibliotecaInBD(db, json) + ' de Valencia'
		return resultado
	})
	*/
}

async function insertBibliotecaInBD(db, entrada) {
  
	// Crea un string con la consulta de las provincias que no están ya en la BD
	var insertar = 'INSERT INTO biblioteca (nombre, tipo, direccion, codigoPostal, codigoLocalidad, longitud, latitud, telefono, email) VALUES '
	var consultaNecesaria=0
	for (var i = 0; i < entrada.length; i++) {
		let codigoPostal = utilities.getNumber(entrada[i].cpostal)
		if (codigoPostal !== -1 ) {
			if (codigoPostal < 1000) {
				codigoPostal = codigoPostal*1000
			}
		}
		insertar += '("' + entrada[i].alies + '", '
		insertar += '"' + entrada[i].nom + '", '
		insertar += '"' + entrada[i].via + '", '
		insertar += codigoPostal + ', '
		insertar += codigoPostal%1000 + ', '
		insertar += parseFloat(entrada[i].longitud) + ', '
		insertar += parseFloat(entrada[i].latitud) + ', '
		insertar += (!isNaN(parseInt(entrada[i].telefon1.replace(/\s/g, '')))) ? parseInt(entrada[i].telefon1.replace(/\s/g, '')) + ', ' :  'null, '
		insertar += '"' + entrada[i].email + '"'
		insertar += '), '
		consultaNecesaria++
	}
	insertar = insertar.substring(0, insertar.length - 2) + '; '
	return new Promise(resolve => {
        
		db.query(insertar, (err, result) => {
			if (err) {
				console.log(err)
				resolve('Error al insertar Bibliotecas')
			}
			resolve('Se han insertado ' + consultaNecesaria +  ' bibliotecas')
		})
	})

}

async function insertLocalidadInBD(db, entrada) {
	// Creamos maps para eliminar localidades duplicadas de antemano, así no se sobrecarga la BD
	var archivoMapArr = new Map(entrada.map(item=>{
        
		let codigo = utilities.getNumber(item.cpostal)
		if (codigo !== -1 ) {
			if (codigo < 1000) {
				codigo = codigo*1000
			}
			return [codigo,item.municipality]
		}
	}))
	// Conversión de maps a array
	let claves = [...archivoMapArr.keys()]
	let valores = [...archivoMapArr.values()]

	// Crea un string con la consulta de las Localidades que no están ya en la BD
	var insertar = 'INSERT INTO localidad (codigo, nombre, codigoProvincia) VALUES '
	var consultaNecesaria=0
	for (var i = 0; i < claves.length; i++) {
		let cuenta = new Promise(resolve => {
			log('entro aquí5')
			db.query('SELECT COUNT(codigo) as cuenta FROM localidad WHERE codigo = ' + claves[i] +';', (err, result) => {
				if (err) {
					console.log(err)
					resolve(false)
				}
				resolve(result[0].cuenta === 0)
			})
		})
		if ( await cuenta ){
			insertar += '(' + claves[i] + ', "' + valores[i]  + '", ' + Math.trunc(claves[i]/1000)  + '), '
			consultaNecesaria++
		}
	}
	insertar = insertar.substring(0, insertar.length - 2) + '; '

	// Inserta, si es necesario, las nuevas Localidades
	if(consultaNecesaria>0){
      
		return new Promise(resolve => {
			db.query(insertar, (err, result) => {
				if (err) {
					console.log(err)
					resolve('Error al insertar Localidades')
				}
				resolve('Se han insertado ' + consultaNecesaria +  ' localidades')
			})
		})
	}
	return 'No se ha insertado ninguna localidad nueva'
}

async function insertarProvinciaInBD(db, entrada) {
	// Creamos maps para eliminar provincias duplicadas de antemano, así no se sobrecarga la BD
	var archivoMapArr = new Map(entrada.map(item=>{
       
		let codigo = utilities.getNumber(item.cpostal)
		if (codigo !== -1 ) {
			if (codigo < 1000) {
				codigo = codigo*1000
			}
			codigo = Math.trunc(codigo/1000)
			return [codigo,item.territory]
		}
	}))
	// Conversión de maps a array
	let claves = [...archivoMapArr.keys()]
	let valores = [...archivoMapArr.values()]

	// Crea un string con la consulta de las provincias que no están ya en la BD
	var insertar = 'INSERT INTO provincia (codigo, nombre) VALUES '
	var consultaNecesaria=0
	for (var i = 0; i < claves.length; i++) {
		let cuenta = new Promise(resolve => {
			db.query('SELECT COUNT(codigo) as cuenta FROM provincia WHERE codigo = ' + claves[i] +';', (err, result) => {
				if (err) {
					console.log(err)
					resolve(false)
				}
				resolve(result[0].cuenta === 0)
			})
		})
		if ( await cuenta ){
			insertar += '(' + claves[i] + ', "' + valores[i]  + '"), '
			consultaNecesaria++
		}
	}
	insertar = insertar.substring(0, insertar.length - 2) + '; '

	// Inserta, si es necesario, las nuevas provincias
	if(consultaNecesaria>0){
		return new Promise(resolve => {
			db.query(insertar, (err, result) => {
				if (err) {
					console.log(err)
					resolve('Error al insertar Provincias')
				}
				resolve('Se han insertado ' + consultaNecesaria +  ' provincias')
			})
		})
	}
	return 'No se ha insertado ninguna provincia nueva'
}