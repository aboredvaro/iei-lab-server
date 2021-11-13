import log from './log.js'
import * as utilities from './utilities.js'
import * as query from './query.js'

export async function getQueryString(archivo) {
	//log(sql)
     var insertProvincia = 'INSERT INTO provincia (codigo, nombre) VALUES '






 
        
        let archivoMap = archivo.map(item=>{
            return [item.territory,item]
        });
        var archivoMapArr = new Map(archivoMap); // Pares de clave y valor
        
        let unicos = [...archivoMapArr.values()]; // Conversión a un array
        
        console.log(unicos);
     var insertLocalidad = 'INSERT INTO localidad (codigo, nombre, codigoProvincia) VALUES '
     var insertBiblioteca = 'INSERT INTO provincia (nombre, tipo, direccion, codigoPostal, longitud, latitud, telefono, email, descripcion) VALUES '
     for(let i = 0; i < archivo.length; i++) {
          log(archivo[i].postalcode)
          let codigo = utilities.getNumber(archivo[i].postalcode)
          if (codigo !== -1 ) {
               if (codigo < 1000) {
                    codigo = codigo*1000
               }
               codigo = Math.trunc(codigo/1000)
               insertProvincia += '(' + codigo + ', "' + archivo[i].territory + '"), '
          }


         
     }



     insertProvincia = insertProvincia.substring(0, insertProvincia.length - 2) + '; '
     insertLocalidad = insertLocalidad.substring(0, insertLocalidad.length - 2) + '; '
     insertBiblioteca = insertBiblioteca.substring(0, insertBiblioteca.length - 2) + '; '
     log(insertProvincia);
     log(insertLocalidad);
     log(insertBiblioteca);
}

export async function insertProvinciaInBD(db, entrada) {
     // Creamos maps para eliminar provincias duplicadas de antemano, así no se sobrecarga la BD
     var archivoMapArr = new Map(entrada.map(item=>{
          let codigo = utilities.getNumber(item.postalcode)
          if (codigo !== -1 ) {
               if (codigo < 1000) {
                    codigo = codigo*1000
               }
               codigo = Math.trunc(codigo/1000)
               return [codigo,item.territory]
          }
     }))
     // Concersión a un array, más manejable
     let claves = [...archivoMapArr.keys()]
     let valores = [...archivoMapArr.values()]

     // Crea consulta de las provincias que no están ya en la BD
     var insertProvincia = 'INSERT INTO provincia (codigo, nombre) VALUES '
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
               insertProvincia += '(' + claves[i] + ', "' + valores[i]  + '"), '
               consultaNecesaria++
          }
     }
     insertProvincia = insertProvincia.substring(0, insertProvincia.length - 2) + '; '

     if(consultaNecesaria>0){
          return new Promise(resolve => {
               db.query(insertProvincia, (err, result) => {
                    if (err) {
                         console.log(err)
                         resolve('Error al insertar Provincias')
                    }
                    log(result)
                    resolve('Se han insertado ' + consultaNecesaria +  'provincias')
               })
          })
     }
     return 'No se ha insertado ninguna provincia nueva'
}
