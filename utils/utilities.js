import fs from 'fs'
import {By, Key, Builder, until} from 'selenium-webdriver'
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

/**
 * @description Comprueba si el parámetro introducido está sin definir o vacío
 * @param {*} valor 
 * @returns Devuelve False si contiene datos y True en caso contrario
 */
export function isEmpty(valor){
	if ((typeof valor) !== 'undefined' && JSON.stringify(valor) != '""') {
		return false
	}
	return true
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

export async function buscarCoordenadasGPS(location) {
	// Cargar chrome y la página donde haremos la búsqueda
	let driver = await new Builder().forBrowser('chrome').build()
	await driver.get('https://maps.google.com/')

	// Aceptar términos y condiciones
	await driver.executeScript('window.scrollBy(0,1000)')
	await driver.findElement(By.xpath('/html/body/c-wiz/div/div/div/div[2]/div[1]/div[4]/form/div/div/button')).sendKeys(Key.RETURN)

	// Introducir los valores en el buscador
	//await driver.findElement(By.xpath('/html/body/div[3]/div[9]/div[3]/div[1]/div[1]/div[1]/div[2]/form/div/div[3]/div/input[1]')).sendKeys(location)
	await driver.findElement(By.id('searchboxinput')).sendKeys(location)
	await driver.findElement(By.xpath('/html/body/div[3]/div[9]/div[3]/div[1]/div[1]/div[1]/div[2]/div[1]/button')).click()

	// Esperar a que busque (he puesto 120 seg de espera... aunque eso es el máximo que esperará)
	await driver.wait(until.urlContains('@'), 120000)

	// Obtener la url en una variable y cerrar el navegador
	let url = await driver.getCurrentUrl()
	await driver.close()
	await driver.quit()

	// Limpiar URL y obtener longitud y latitud de ella, esto ya nada tiene que ver con selenium
	url = url.slice( url.indexOf('@') + 1, url.indexOf('/', url.indexOf('@')) - 4 )
	let arr = url.split(',')
	const json = {
		'lat': arr[0],
		'lon': arr[1]
	}

	return json
}

export function getFechaHoraNow(){
	var today = new Date()
	var day = today.getDate() + ''
	var month = (today.getMonth() + 1) + ''
	var year = today.getFullYear() + ''
	var hour = today.getHours() + ''
	var minutes = today.getMinutes() + ''
	var seconds = today.getSeconds() + ''

	day = checkZero(day)
	month = checkZero(month)
	year = checkZero(year)
	hour = checkZero(hour)
	minutes = checkZero(minutes)
	seconds = checkZero(seconds)

	return day + '/' + month + '/' + year + ' ' + hour + ':' + minutes + ':' + seconds
}

function checkZero(data){
	if(data.length == 1){
		data = '0' + data
	}
	return data
}