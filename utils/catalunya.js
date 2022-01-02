import fs from 'fs'
import xml2js from 'xml2js'

import log from './log.js'
import * as utilities from './utilities.js'
import * as query from './query.js'

export async function insertXML(db, path) {
	var parser = new xml2js.Parser()
	return new Promise(resolve => {
		fs.readFile('./' + path + '/catalunya.xml', function(err, data) {
			parser.parseString(data, function (err, result) {
				resolve(result)
			})
		})
	}).then(json =>
		json.response.row
	).then(async(json) => {
		//await query.regenerarBD(db)
		var resultado = ''
		log('⏳ Insertando provincias de Catalunya')
		resultado += await insertarProvinciaInBD(db, json) + ' de Catalunya'
		resultado += '\n'
		log('⏳ Insertando localidades de Catalunya')
		resultado += await insertLocalidadInBD(db, json) + ' de Catalunya'
		resultado += '\n'
		log('⏳ Insertando bibliotecas de Catalunya')
		resultado += await insertBibliotecaInBD(db, json) + ' de Catalunya'
		log(resultado)
		return true
	})
}

async function insertBibliotecaInBD(db, entrada) {
	// Crea un string con la consulta de las provincias que no están ya en la BD
	var cabecera = 'INSERT INTO biblioteca (nombre, tipo, direccion, codigoPostal, codigoLocalidad, longitud, latitud, telefono, email) VALUES '
	var consultaNecesaria=0
	var respuesta=''
	
	var jump = 350
	for (let i = 0; i < entrada.length; i=i+jump) {
	//for (let i = 0; i < jump; i=i+jump) {
		var insertar = cabecera

		// este for tiene que ser asíncrono
		for (let j = i; j < i+jump && j < entrada.length ; j++) {
			let codigoPostal = utilities.getNumber(entrada[j].cpostal)
			if (codigoPostal !== -1 ) {
				if (codigoPostal < 1000) {
					codigoPostal = codigoPostal*1000
				}
			}
			insertar += '("' + utilities.clearString(entrada[j].nom.toString().trim()) + '", '

			// Si, lo sé, es una jugada muy guarra, pero funciona...
			let descripcion = JSON.stringify(entrada[j].propietats)
			descripcion = descripcion.substring(descripcion.lastIndexOf('|')+1)
			// aqui hay que revisar el pater de esto
			descripcion = descripcion.replace('n"', '$')
			descripcion = descripcion.replace('n\'', '$')
			//log(descripcion)
			descripcion = descripcion.substring(0, descripcion.lastIndexOf('$')-3)

			insertar += '"' + utilities.clearString(descripcion) + '", '
			insertar += '"' + utilities.clearString(entrada[j].via) + '", '
			insertar += codigoPostal + ', '
			insertar += parseInt(entrada[j].codi_municipi) + ', '
			insertar += parseFloat(entrada[j].longitud) + ', '
			insertar += parseFloat(entrada[j].latitud) + ', '
			if (isNaN(parseInt(entrada[j].telefon1))) {
				insertar += 'null, '
			} else if (parseInt(entrada[j].telefon1) < 600000000) {
				insertar += parseInt(entrada[j].telefon1.toString().replace(/\s/g, '')) + ', '
			} else {
				insertar += '' + parseInt(entrada[j].telefon1) + ', '
			}
			insertar += '"' + entrada[j].email + '"'
			insertar += '), '
			consultaNecesaria++
		}	
		insertar = insertar.substring(0, insertar.length - 2) + '; '
		
		respuesta = new Promise(resolve => {
			db.query(insertar, (err, result) => {
				if (err) {
					console.log(err)
					resolve('Error al insertar Bibliotecas')
				}
				resolve('✅ Se han insertado ' + consultaNecesaria +  ' bibliotecas')
			})
		})
		utilities.sleep(1500)
		//log('Paquete: ' + i )
		
	}
	return await respuesta

}

async function insertLocalidadInBD(db, entrada) {
	// Creamos maps para eliminar localidades duplicadas de antemano, así no se sobrecarga la BD
	var archivoMapArr = new Map(entrada.map(item=>{
		let codigo = utilities.getNumber(item.cpostal)
		if (codigo !== -1 ) {
			if (codigo < 1000) {
				codigo = codigo*1000
			}
			return [codigo,item.poblacio]
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
				resolve('✅ Se han insertado ' + consultaNecesaria +  ' localidades')
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
			return [codigo,'Sin Información']
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