import process from 'process'

export default function log(msg) {
	return process.env.NODE_ENV && console.log(msg)
}
