import express, { Request, Response } from 'express'
import { config, log } from './utils'
import http from 'http'
import { createNewDocument, saveDocument } from './DocumentHandler'
import bodyParser from 'body-parser'
import { DroppedDocument } from '$shared/types'

const app = express()
app.use(bodyParser.json())
const port = config.extensionServer.port

app.get('/', (req: Request, res: Response) => {
	log(req.url)
	res.send('Hello World!')
})

app.post('/new', async (req: Request<object, object, DroppedDocument>, res: Response) => {
	log(req.url)
	const data = req.body
	const newID = await createNewDocument()
	log(`New document created with ID: ${newID}`)
	saveDocument(
		{
			document_id: newID,
			title: data.title,
			mime: data.mime,
			deleted: false,
			deleted_time_left: 0
		},
		data.content
	)
	res.status(201).send({ id: newID })
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
