import { ServerMessage } from '$shared/types'

export class MessageQ {
	private queue: ServerMessage[] = []
	private static instance: MessageQ

	public static getInstance(): MessageQ {
		if (!MessageQ.instance) {
			MessageQ.instance = new MessageQ()
		}
		return MessageQ.instance
	}

	public getQueue(): ServerMessage[] {
		return this.queue
	}
}
