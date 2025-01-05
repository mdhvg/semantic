import { ServerRequest, ServerResponse } from '$shared/types'
import net from 'net'
import { Delay, config } from './utils'

export class ServerConnector {
	private static instance: ServerConnector
	private client: net.Socket
	private onDataCallback: (data: ServerResponse) => void = () => {}
	public connected: boolean = false

	private constructor() {
		this.client = new net.Socket()
		this.client.on('data', (data: Buffer) => {
			if (this.onDataCallback) {
				const response: ServerResponse = JSON.parse(data.toString())
				this.onDataCallback(response)
			}
		})
	}

	public onData(callback: (data: ServerResponse) => Promise<void>): void {
		this.onDataCallback = callback
	}

	public static getInstance(): ServerConnector {
		if (!ServerConnector.instance) {
			ServerConnector.instance = new ServerConnector()
		}
		return ServerConnector.instance
	}

	private async attemptConnection(port: number, host: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.client.removeAllListeners('connect')
			this.client.removeAllListeners('error')
			this.client.removeAllListeners('close')
			this.client.once('connect', () => {
				this.connected = true
			})
			this.client.once('error', (error) => {
				reject(error)
			})
			this.client.once('close', () => {
				reject(new Error('Connection closed'))
			})
			this.client.connect(port, host, () => {
				console.log('Connected to server')
				this.heartbeat()
				resolve()
			})
			setTimeout(() => {
				reject(new Error('Connection attempt timed out'))
			}, 1000)
		})
	}

	private async heartbeat(): Promise<void> {
		while (this.connected) {
			this.sendCommand('Heartbeat')
			await Delay(1000)
		}
	}

	public async connect(
		port: number,
		host: string,
		maxAttempts: number = 20,
		timeout: number = 1000,
		delay: number = 5500
	): Promise<void> {
		await Delay(delay)
		let tries = 0
		while (!this.connected && tries < maxAttempts) {
			try {
				await this.attemptConnection(port, host)
			} catch (error) {
				console.error(`Failed to connect (attempt ${tries}): ${error}`)
				console.log(`Retrying in ${timeout} ms...`)
			}
			if (!this.connected) {
				await new Promise((resolve) => setTimeout(resolve, timeout))
				tries++
			}
		}
	}

	private async write(message: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.client.writable) {
				this.client.write(message)
				resolve()
			} else {
				console.error('Client is not writable')
				this.connected = false
				this.client.end()
				reject()
			}
		})
	}

	public async sendCommand(command: string): Promise<void> {
		try {
			await this.write(`C;;0;;${command}$$`.padEnd(config.maxMessageLen, '\0'))
		} catch (error) {
			// TODO: Do something here
		}
	}

	public async sendData(request: ServerRequest, isQuery: boolean = false): Promise<void> {
		let header = 'D'
		if (isQuery) {
			header = 'Q'
		}
		await this.write(
			`${header};;${request.id};;${request.size}$$`.padEnd(config.maxMessageLen, '\0')
		)
		let currentIndex = 0
		while (currentIndex < request.size) {
			const block = createPacket(header, request.id, request.content, currentIndex)
			let message = block.message
			const shift = block.shift
			currentIndex += shift
			message = message.padEnd(config.maxMessageLen, '\0')
			await this.write(message)
		}
	}
}

function createPacket(
	header: string,
	id: number,
	content: string,
	currentIndex: number
): { message: string; shift: number } {
	// TODO: Change the length of id (string) to 20, which is length of 18446744073709551616 (max 64-bit integer)
	const writeableLen = config.maxMessageLen - (JSON.stringify(id).length + 7)
	const slice = content.slice(currentIndex, currentIndex + writeableLen)
	// TODO: Change the id to 0 padded 20 digit string
	return { message: `${header};;${id};;${slice}$$`, shift: slice.length }
}
