import fs from 'fs'
import log from './log.js'
import {By, Key, Builder} from 'selenium-webdriver'

/**
 * @description Comprueba si el valor introducido es un entero
 * @param {*} valor 
 * @returns Devuelve -1 en caso de error o el número en caso contrario
 */
export function getNumber(valor){
	var numero = parseInt(valor)
	if (isNaN(numero) || (typeof valor) === 'undefined'){
		return -1
	}
	return numero
}

export function clearString(string){
	return string.toString().replace(/[&\\#+()$~%'":*?<>{}]/g, '-')
}

export function capitalizarPrimeraLetra(str) {
	//return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
	const arr = str.toString().split(' ')
	for (var i = 0; i < arr.length; i++) {
		arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1).toLowerCase()
	}
	return arr.join(' ')
}

export function getNumbersInString(str) {
	var num = str.toString().replace(/[^0-9]/g, '')
	return parseInt(num, 10)
}

export function xml2json(xml) { 
	try { 
		var obj = {} 
		if (xml.children.length > 0) { 
			for (var i = 0; i < xml.children.length; i++) { 
				var item = xml.children.item(i) 
				var nodeName = item.nodeName
				
				if (typeof (obj[nodeName]) == 'undefined') { 
					obj[nodeName] = xml2json(item) 
				} else { 
					if (typeof (obj[nodeName].push) == 'undefined') { 
						var old = obj[nodeName]
						obj[nodeName] = []
						obj[nodeName].push(old)
					} 
					obj[nodeName].push(xml2json(item))
				} 
			} 
		} else { 
			obj = xml.textContent 
		} return obj
	} catch (e) { 
		console.log(e.message) 
	} 
}

export async function csvJSON(archivo){

	var csv = fs.readFileSync(archivo)

	var array = csv.toString().split('\n')

	let result = []

	let headers = array[0].split(';')

	for (let i = 1; i < array.length - 1; i++) {
		let obj = {}
		let str = array[i]
		let s = ''
		let flag = 0
		for (let ch of str) {
			if (ch === '"' && flag === 0) {
				flag = 1
			}
			else if (ch === '"' && flag == 1) flag = 0
			if (ch === ';' && flag === 0) ch = '|'
			if (ch !== '"') s += ch
		}
		let properties = s.split('|')
		for (let j in headers) {
			if (properties[j].includes(';')) {
				obj[headers[j]] = properties[j].split(';').map(item => item.trim())
			} else {
				obj[headers[j]] = properties[j]
			}
		}
		result.push(obj)
	}
	return JSON.parse(JSON.stringify(result))
}

export async function buscarCoordenadasGPS(){
	let direccion = 'C/ Dos de mayo, 22, 14200, Peñarroya-Pueblonuevo (Córdoba)'

	// Include selenium webdriver 
	let driver = await new Builder().forBrowser('chrome').build()
	await driver.get('https://www.coordenadas-gps.com/')

	await driver.findElement(By.name('q')).sendKeys(direccion, Key.RETURN)
}