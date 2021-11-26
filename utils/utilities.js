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
export function csvJSON(csv){

    var lines=csv.split("\n");
  
    var result = [];
  
    var headers=lines[0].split(",");
  
    for(var i=1;i<lines.length;i++){
  
        var obj = {};
        var currentline=lines[i].split(",");
  
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
  
        result.push(obj);
  
    }
    
    
    return JSON.stringify(result); //JSON
  }