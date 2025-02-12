import express, { Request, Response } from 'express'
import { config, log } from './utils'
import http from 'http'

const app = express()
const port = config.extensionServer.port

app.get('/', (req: Request, res: Response) => {
	log(req.url)
	res.send('Hello World!')
})

export const startServer = (): Promise<http.Server> => {
	return new Promise((resolve, reject) => {
		const server = app.listen(port, (err) => {
			if (err) {
				return reject(err)
			}
			log(`Extension server listening at http://localhost:${port}`)
			resolve(server)
		})
	})
}

export const stopServer = (server: http.Server): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (server) {
			server.close((err) => {
				if (err) {
					return reject(err)
				}
				log('Extension server stopped')
				resolve()
			})
		} else {
			resolve()
		}
	})
}
