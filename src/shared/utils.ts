import { existsSync, mkdirSync, readFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function configReader() {
	const config = JSON.parse(readFileSync('config.json', 'utf8'))
	if (typeof config['documentsDir'] !== 'string') {
		if (config['documentsDir']['joinHomeDir']) {
			config['documentsDir'] = join(homedir(), ...config['documentsDir']['path'])
		}
	}
	if (typeof config['documentsPlaintextDir'] !== 'string') {
		if (config['documentsPlaintextDir']['joinHomeDir']) {
			config['documentsPlaintextDir'] = join(homedir(), ...config['documentsPlaintextDir']['path'])
		}
	}
	if (!existsSync(config['documentsDir'])) {
		console.log(`Creating documents directory at ${config['documentsDir']}`)
		mkdirSync(config['documentsDir'], { recursive: true })
	}
	if (!existsSync(config['documentsPlaintextDir'])) {
		console.log(`Creating plaintext documents directory at ${config['documentsPlaintextDir']}`)
		mkdirSync(config['documentsPlaintextDir'], { recursive: true })
	}
	return config
}

export const Delay = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms))

export const config = configReader()

export const splitContent = (content: string, wordsPerChunk: number): string[] => {
	let wordsAdded = 0
	let start = 0
	const chunks: string[] = []
	for (let i = 0; i < content.length; i++) {
		if (content[i] === ' ') {
			wordsAdded++
		}
		if (wordsAdded === wordsPerChunk) {
			chunks.push(content.slice(start, i))
			start = i
			wordsAdded = 0
		}
	}
	if (start < content.length) {
		chunks.push(content.slice(start))
	}
	return chunks
}

// TODO: This might be a better implementation of splitContent
// export const splitContent = (content: string, wordsPerChunk: number): string[] => {
// 	const words = content.split(/(\s+)/) // Split by whitespace, keeping the whitespace in the result
// 	const chunks: string[] = []
// 	let chunk: string[] = []
// 	let wordCount = 0

// 	for (const word of words) {
// 		if (word.trim().length === 0) {
// 			// If the word is just whitespace, add it to the current chunk
// 			chunk.push(word)
// 		} else {
// 			// If adding this word would exceed the chunk size, start a new chunk
// 			if (wordCount + 1 > wordsPerChunk) {
// 				chunks.push(chunk.join(''))
// 				chunk = []
// 				wordCount = 0
// 			}
// 			chunk.push(word)
// 			wordCount++
// 		}
// 	}

// 	// Add the last chunk if it has any words
// 	if (chunk.length > 0) {
// 		chunks.push(chunk.join(''))
// 	}

// 	return chunks
// }
