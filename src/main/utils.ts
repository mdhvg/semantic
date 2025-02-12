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
import { TokenTextSplitter } from 'langchain/text_splitter'

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
		log(`Creating documents directory at ${config['documentsDir']}`)
		mkdirSync(config['documentsDir'], { recursive: true })
	}
	if (!existsSync(config['documentsPlaintextDir'])) {
		log(`Creating plaintext documents directory at ${config['documentsPlaintextDir']}`)
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
	log(pico.bold(pico.blue('Client')) + ':' + pico.redBright('main') + ':', ...messages)
}

const addSpacesBetweenInlineNodes = () => {
	log()
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

export const matcher = (a: string, b: string): number => {
	let old: number[] = new Array(a.length + 1).fill(a.length)
	const cur: number[] = new Array(a.length + 1).fill(a.length)
	for (let j = b.length - 1; j >= 0; j--) {
		for (let i = a.length - 1; i >= 0; i--) {
			if (a[i] === b[j]) {
				cur[i] = old[i + 1] - 1
			} else {
				cur[i] = Math.min(old[i], cur[i + 1]) + 1
			}
		}
		old = cur
	}
	return old[0]
}

export const tokenizeText = async (
	text: string,
	tokensPerChunk: number,
	mime: string
): Promise<string[]> => {
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

	const plainText = he.decode(String(processor.processSync(text).value)).normalize()

	const splitter = new TokenTextSplitter({
		chunkSize: tokensPerChunk,
		chunkOverlap: 2
	})

	return await splitter.splitText(plainText)
}

// TODO: Change mime to an enum
// export const splitContent = async (
// 	content: string,
// 	wordsPerChunk: number,
// 	mime: string
// ): Promise<{ plainTextChunks: string[]; mimeFormatChunks: string[] }> => {
// 	console.time('splitText')
// 	const splitter = new TokenTextSplitter({
// 		chunkSize: wordsPerChunk,
// 		chunkOverlap: 2
// 	})
// 	console.timeEnd('splitText')

// 	const chunks = await splitter.splitText(plainText)
// 	const plainTextChunks = chunks.map((chunk) => chunk)

// 	console.time('splitMime')
// 	let contentStartIndex = 0
// 	const mimeFormatChunks: string[] = []

// 	for (let i = 0; i < plainTextChunks.length; i++) {
// 		let lastIndex: number = content.length
// 		if (i !== plainTextChunks.length - 1) {
// 			lastIndex =
// 				matcher(content.slice(contentStartIndex, lastIndex), plainTextChunks[i]) + contentStartIndex
// 		}
// 		console.log(`${plainTextChunks[i].length}\t${contentStartIndex}\t${lastIndex}`)
// 		const split = content.slice(contentStartIndex, lastIndex)
// 		mimeFormatChunks.push(split)
// 		contentStartIndex = lastIndex
// 	}
// 	console.timeEnd('splitMime')

// 	return { plainTextChunks, mimeFormatChunks }
// }
