import { existsSync, mkdirSync, readFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { unified } from 'unified'
import rehypeRemark from 'rehype-remark'
import stripMarkdown from 'strip-markdown'
import rehypeParse from 'rehype-parse'
import remarkStringify from 'remark-stringify'
import remarkParse from 'remark-parse'
import he from 'he'
import { visit } from 'unist-util-visit'
import { Literal, Node, Parent } from 'unist'
import pico from 'picocolors'

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

export const log = (...messages: unknown[]): void => {
	console.log(pico.bold(pico.blue('Client')) + ':' + pico.greenBright('main') + ':', ...messages)
}

export const logError = (...messages: unknown[]): void => {
	console.log(pico.bold(pico.blue('Client')) + ':' + pico.redBright('main') + ':', ...messages)
}

const addSpacesBetweenInlineNodes = () => {
	return (tree: Node): void => {
		visit(tree, 'element', (node: Parent) => {
			if (node.type === 'element' && node.children) {
				const newChildren: Node[] = []
				node.children.forEach((child: Node) => {
					newChildren.push(child)
					newChildren.push({ type: 'text', value: ' ' } as Literal)
				})
				node.children = newChildren
			}
		})
	}
}

// TODO: Change mime to an enum
export const splitContent = (
	content: string,
	wordsPerChunk: number,
	mime: string
): { plainTextChunks: string[]; mimeFormatChunks: string[] } => {
	let processor
	switch (mime) {
		case 'text/html':
			processor = unified()
				.use(rehypeParse)
				.use(addSpacesBetweenInlineNodes)
				.use(rehypeRemark)
				.use(remarkStringify)
				.use(stripMarkdown)
			break
		default:
			processor = unified().use(remarkParse).use(remarkStringify).use(stripMarkdown)
			break
	}

	const plainText = he.decode(String(processor.processSync(content).value))
	const wordsWithSpaces = plainText.match(/[A-Za-z'.,-]+/g)?.filter((word) => word.length > 2)

	const plainTextChunks: string[] = []
	const mimeFormatChunks: string[] = []

	let currentChunk: string[] = []
	let currentWords = 0
	let contentStartIndex = 0
	let contentLastIndex = 0

	if (!wordsWithSpaces) return { plainTextChunks, mimeFormatChunks }
	for (let i = 0; i < wordsWithSpaces.length; i++) {
		const newWord = wordsWithSpaces[i]
		currentChunk.push(newWord)
		currentWords++

		let lastWord = content.slice(contentStartIndex, contentLastIndex).slice(-newWord.length)
		while (lastWord !== newWord) {
			contentLastIndex++
			lastWord = content.slice(contentStartIndex, contentLastIndex).slice(-newWord.length)
		}

		if (currentWords >= wordsPerChunk || i === wordsWithSpaces.length - 1) {
			const plainChunk = currentChunk.join(' ')
			let formatChunk: string = ''
			if (i === wordsWithSpaces.length - 1) {
				formatChunk = content.slice(contentStartIndex)
			} else {
				formatChunk = content.slice(contentStartIndex, contentLastIndex)
			}

			plainTextChunks.push(plainChunk)
			mimeFormatChunks.push(formatChunk)

			contentStartIndex = contentLastIndex
			currentChunk = []
			currentWords = 0
		}
	}
	return { plainTextChunks, mimeFormatChunks }
}
