import { ServerMessage, ServerResponse } from '$shared/types'
import net from 'net'
import { Delay, log, logError } from './utils'

export class ServerConnector {
	private static instance: ServerConnector
	private client: net.Socket
	private onDataCallback: (data: ServerResponse) => void = () => {}
	public connected: boolean = false
	private buffer: Buffer = Buffer.alloc(0)

	private constructor() {
		this.client = new net.Socket()
		this.client.on('data', (data: Buffer) => {
			this.buffer = Buffer.concat([this.buffer, data])

			while (this.buffer.length >= 4) {
				const length = this.buffer.readUInt32BE(0)
				if (this.buffer.length < length + 4) {
					break
				}
				const message = this.buffer.subarray(4, length + 4)
				this.buffer = this.buffer.subarray(length + 4)
				if (this.onDataCallback) {
					const response: ServerResponse = JSON.parse(message.toString())
					this.onDataCallback(response)
				}
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
				log('Connected to server')
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
			this.sendMessage({ kind: 'COMMAND', command: 'heartbeat' })
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
				logError(`Failed to connect (attempt ${tries}): ${error}`)
				log(`Retrying in ${timeout} ms...`)
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
				const length = Buffer.byteLength(message)
				const header = Buffer.alloc(4)
				header.writeUint32BE(length, 0)
				this.client.write(header)
				this.client.write(message)
				resolve()
			} else {
				logError('Client is not writable')
				this.connected = false
				this.client.end()
				reject()
			}
		})
	}

	public async sendMessage(message: ServerMessage): Promise<void> {
		try {
			await this.write(JSON.stringify(message))
		} catch (error) {
			logError('Failed to send message:', error)
		}
	}
}
