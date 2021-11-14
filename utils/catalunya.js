import { readFile } from 'fs/promises'

import log from './log.js'
import * as utilities from './utilities.js'
import * as query from './query.js'

const catalunya = await readFile(new URL('../fuente/catalunya.xml', import.meta.url))

export async function insertXML(db) {
	log(catalunya)
	//query.regenerarBD(db)
	var resultado = ''
	//resultado += await insertarProvinciaInBD(db, euskadi) + ' de Catalunya'
	resultado += '\n'
	//resultado += await insertLocalidadInBD(db, euskadi) + ' de Catalunya'
	resultado += '\n'
	//resultado += await insertBibliotecaInBD(db, euskadi) + ' de Catalunya'
	return resultado
}