import fs from 'fs'
import {By, Key, Builder} from 'selenium-webdriver'
import log from './log.js'

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

/**
 *  'ATENCIÓN, GITANADA'
 * Lo que consigo con esto es detener 'mseg ' milisegundos, bloqueando por completo 
 * la ejecución de todo el código y continuando después de ese tiempo, pero con 
 * ejecución síncrona.
 * 
 * Lo sé, a tomar por culo las ventajas de la asincronía, pero así no peto el servidor
 * con muchas consultas, y no tengo que hacer ningún for await raro de cojones de 
 * configurar.
 * @param {*} mseg 
 */
export function sleep(mseg ) {
	var start = new Date().getTime()
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > mseg ) {
			break
		}
	}
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
	let direccion = '14200 Peñarroya-Pueblonuevo, Dos de mayo,22'
	//let direccion = '1B, Camino de Vera, 46022 Valencia, España'

	/*
	// Include selenium webdriver 
	let driver = await new Builder().forBrowser('chrome').build()
	await driver.get('https://www.coordenadas-gps.com/')
	sleep(1000)
	await driver.executeScript('window.scrollBy(0,750)')
	sleep(1000)
	await driver.findElement(By.id('address')).sendKeys(direccion, Key.RETURN)
	await driver.executeScript('window.scrollBy(0,150)')
	sleep(1000)
	await driver.findElement(By.xpath('//*[@id="wrap"]/div[2]/div[3]/div[1]/form[1]/div[2]/div/button')).click()
	sleep(1000)
	let longitude = await driver.findElement(By.xpath('//*[@id="longitude"]')).getAttribute('value')
	let latitude = await driver.findElement(By.xpath('//*[@id="latitude"]')).getAttribute('value')

	log('lat: ' + latitude + ' - lng: ' + longitude)
	*/

	let driver = await new Builder().forBrowser('chrome').build()
	log('cargo pagina')
	await driver.get('https://wego.here.com/')
	sleep(2500)
	log('cargar dirección')
	await driver.findElement(By.className('input_search')).sendKeys(direccion, Key.RETURN)
	sleep(2500)
	log('buscar coordenadas')
	let coordenadas = await driver.findElement(By.xpath('/html/body/div[1]/div[6]/div[1]/div/div[4]/div/div/div[2]/div/section[2]/section/div/dl/dd'))[0]
	log(coordenadas)

}