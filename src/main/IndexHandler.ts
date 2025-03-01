import { existsSync } from 'fs'
import { Index, MetricKind } from 'usearch'
import { config } from './utils'

export class IndexHandler {
	private static instance: IndexHandler
	private index: Index
	private constructor() {
		// TODO: Change the vector size to be dynamic based on model currently loaded
		this.index = new Index(768, MetricKind.Cos)
		if (existsSync(config.indexFile)) {
			this.index.load(config.indexFile)
		}
	}

	public static getInstance(): IndexHandler {
		if (!IndexHandler.instance) {
			IndexHandler.instance = new IndexHandler()
		}
		return IndexHandler.instance
	}

	public getIndex(): Index {
		return this.index
	}

	public saveIndex(): void {
		this.index.save(config.indexFile)
	}

	public updateIndex(id: number, vector: number[]): void {
		if (this.index.contains(BigInt(id))) {
			this.index.remove(BigInt(id))
		}
		this.index.add(BigInt(id), new Float32Array(vector))
	}
}
