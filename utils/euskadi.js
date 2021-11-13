import log from './log.js'

export async function getQueryString(json) {
     log(json)
	//log(sql)
     for(let i = 0; i < 3; i++) {
          log(json.items[i].documentName);  // (o el campo que necesites)
      }
}