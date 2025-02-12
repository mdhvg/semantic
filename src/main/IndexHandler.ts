import { existsSync } from 'fs'
import { Index, MetricKind } from 'usearch'
import { config } from './utils'

export const loadIndex = (): Index => {
	// TODO: Change the vector size to be dynamic based on model currently loaded
	const index = new Index(768, MetricKind.Cos)
	if (existsSync(config.indexFile)) {
		index.load(config.indexFile)
	}
	return index
}

export const saveIndex = (index: Index): void => {
	index.save(config.indexFile)
}
