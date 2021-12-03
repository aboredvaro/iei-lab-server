import fs from 'fs'
import csvtojson from 'csvtojson'

import log from './log.js'
import * as utilities from './utilities.js'
import * as query from './query.js'

export async function insertCSV(db) {

	var json = await utilities.csvJSON('./fuente/valencia.csv')

	//query.regenerarBD(db)
	var resultado = ''
	log('⏳ Insertando provincias de Valencia')
	resultado += await insertarProvinciaInBD(db, json) + ' de Valencia'
	resultado += '\n'
	log('⏳ Insertando localidades de Valencia')
	resultado += await insertLocalidadInBD(db, json) + ' de Valencia'
	resultado += '\n'
	log('⏳ Insertando Bibliotecas de Valencia')
	resultado += await insertBibliotecaInBD(db, json) + ' de Valencia'
	log(resultado)
	return resultado
}

async function insertBibliotecaInBD(db, entrada) {
  
	// Crea un string con la consulta de las provincias que no están ya en la BD
	var insertar = 'INSERT INTO biblioteca (nombre, tipo, direccion, codigoPostal, codigoLocalidad, longitud, latitud, telefono, email) VALUES '
	var consultaNecesaria=0
	const sql = async() => {
		log('\n')
		for (var i = 0; i < entrada.length; i++) {

			let codigoPostal = utilities.getNumber(entrada[i].CP)
			if (codigoPostal !== -1 ) {
				if (codigoPostal < 1000) {
					codigoPostal = codigoPostal*1000
				}
			}

			const direccion = utilities.capitalizarPrimeraLetra(entrada[i].DIRECCION)
			log(`📍 (${i+1}/${entrada.length}) Obteniendo coordenadas para la dirección: ${direccion}, ${codigoPostal}, ${entrada[i].NOM_MUNICIPIO}`)
			await utilities.buscarCoordenadasGPS(`${direccion.replace(/\sNº|\snº/g, '')}, ${codigoPostal}, ${entrada[i].NOM_MUNICIPIO}`).then(res  => {
				log(`🧭 Coordenadas obtenidas = (Latitud: ${res.lat}, Longitud: ${res.lon})\n`)
				
				insertar += '("' + utilities.clearString(utilities.capitalizarPrimeraLetra(entrada[i].NOMBRE)) + '", '
				insertar += '"' + utilities.clearString(utilities.capitalizarPrimeraLetra(entrada[i].TIPO)) + '", '
				insertar += '"' + direccion + '", '
				insertar += codigoPostal + ', '
				insertar += entrada[i].COD_MUNICIPIO + ', '
				insertar += (utilities.getNumber(res.lat) == -1 ? 'null' : res.lat)  + ', '
				insertar += (utilities.getNumber(res.lon) == -1 ? 'null' : res.lon)  + ', '

				let telfno = entrada[i].TELEFONO
				if (telfno.indexOf('-') !== -1) {
					telfno = telfno.substring(0, telfno.indexOf('-'))
				}
				if (telfno.indexOf('/') !== -1) {
					telfno = telfno.substring(0, telfno.indexOf('/'))
				}
				if (telfno.indexOf(' E') !== -1) {
					telfno = telfno.substring(0, telfno.indexOf(' E'))
				}
				if (telfno.indexOf(' A') !== -1) {
					telfno = telfno.substring(0, telfno.indexOf(' A'))
				}
				telfno = utilities.getNumbersInString(telfno)
				if ( isNaN(telfno) ) {
					telfno = 'null'
				}

				insertar += telfno + ', '
				insertar += '"' + utilities.capitalizarPrimeraLetra(entrada[i].EMAIL) + '"'
				insertar += '), '
				consultaNecesaria++
			})
		}
		log('\n')
		return insertar.substring(0, insertar.length - 2) + '; '
	}

	return await sql().then(res => {
		return new Promise(resolve => {
			db.query(res, (err, result) => {
				if (err) {
					console.log(err)
					resolve('Error al insertar Bibliotecas')
				}
				resolve('✅ Se han insertado ' + consultaNecesaria +  ' bibliotecas')
			})
		})
	})
}

async function insertLocalidadInBD(db, entrada) {
	// Creamos maps para eliminar localidades duplicadas de antemano, así no se sobrecarga la BD
	var archivoMapArr = new Map(entrada.map(item=>{
		let codigo = utilities.getNumber(item.CP)
		if (codigo !== -1 ) {
			if (codigo < 1000) {
				codigo = codigo*1000
			}
			return [codigo, [utilities.capitalizarPrimeraLetra(item.NOM_MUNICIPIO), item.COD_PROVINCIA]]
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
			db.query('SELECT COUNT(codigo) as cuenta FROM localidad WHERE codigo = ' + claves[i] +';', (err, result) => {
				if (err) {
					console.log(err)
					resolve(false)
				}
				resolve(result[0].cuenta === 0)
			})
		})
		if ( await cuenta ){
			insertar += '(' + claves[i] + ', "' + valores[i][0]  + '", ' + valores[i][1]  + '), '
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
				resolve('✅ Se han insertado ' + consultaNecesaria +  ' localidades')
			})
		})
	}
	return 'No se ha insertado ninguna localidad nueva'
}

async function insertarProvinciaInBD(db, entrada) {
	// Creamos maps para eliminar provincias duplicadas de antemano, así no se sobrecarga la BD
	var archivoMapArr = new Map(entrada.map(item=>{
		let codigo = utilities.getNumber(item.CP)
		if (codigo !== -1 ) {
			if (codigo < 1000) {
				codigo = codigo*1000
			}
			codigo = Math.trunc(codigo/1000)
			return [codigo, utilities.capitalizarPrimeraLetra(item.NOM_PROVINCIA)]
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
				resolve('✅ Se han insertado ' + consultaNecesaria +  ' provincias')
			})
		})
	}
	return 'No se ha insertado ninguna provincia nueva'
}