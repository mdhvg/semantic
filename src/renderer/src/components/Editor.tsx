'use client'

import { ActiveDocumentContentAtom, ActiveDocumentIDAtom, DocumentContentsAtom } from '@/store'
import {
	BoldItalicUnderlineToggles,
	diffSourcePlugin,
	DiffSourceToggleWrapper,
	directivesPlugin,
	headingsPlugin,
	imagePlugin,
	KitchenSinkToolbar,
	linkPlugin,
	listsPlugin,
	markdownShortcutPlugin,
	MDXEditor,
	MDXEditorMethods,
	quotePlugin,
	toolbarPlugin,
	UndoRedo
} from '@mdxeditor/editor'
import { useAtom, useAtomValue } from 'jotai'
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm'
import { useEffect, useRef } from 'react'

export const MarkdownEditor = (): React.ReactElement => {
	const [content, setContent] = useAtom(ActiveDocumentContentAtom)
	const editorRef = useRef<MDXEditorMethods>(null)
	const activeDocument = useAtomValue(ActiveDocumentIDAtom)
	const documentContents = useAtomValue(DocumentContentsAtom)

	const processContent = (content: string): string => {}

	useEffect(() => {
		console.log('fetching document content')
		activeDocument !== null &&
			(documentContents[activeDocument] === undefined
				? window.api.getDocument(activeDocument).then((fetchedContent) => {
						console.log(documentContents)
						setContent(fetchedContent)
						editorRef.current?.setMarkdown(fetchedContent.length ? fetchedContent : '')
					})
				: editorRef.current?.setMarkdown(documentContents[activeDocument]))
	}, [activeDocument])

	return (
		<MDXEditor
			ref={editorRef}
			markdown={content}
			toMarkdownOptions={{ extensions: [] }}
			plugins={[
				headingsPlugin(),
				listsPlugin(),
				quotePlugin(),
				markdownShortcutPlugin(),
				imagePlugin({
					imagePreviewHandler(imageSource) {
						return new Promise((resolve, reject) => {
							const reader = new FileReader()
							reader.onload = (): void => {
								if (reader.result !== null) {
									resolve(reader.result as string)
								} else {
									reject(new Error('Failed to read file'))
								}
							}
							reader.onerror = reject
							reader.readAsDataURL(new Blob([imageSource]))
						})
					},
					imageUploadHandler(image) {
						return new Promise((resolve, reject) => {
							const reader = new FileReader()
							reader.onload = (): void => {
								if (reader.result !== null) {
									resolve(reader.result as string)
								} else {
									reject(new Error('Failed to read file'))
								}
							}
							reader.onerror = reject
							reader.readAsDataURL(new Blob([image]))
						})
					}
				}),
				directivesPlugin(),
				linkPlugin(),
				diffSourcePlugin()
				// toolbarPlugin({
				// toolbarClassName: 'flex justify-between items-center w-10 h-10'
				// toolbarContents: (): React.ReactElement => {
				// 	return <KitchenSinkToolbar />
				// }
				// })
			]}
			onChange={(newContent) => setContent(newContent)}
			contentEditableClassName="outline-none min-h-screen max-w-none prose-sm pt-2"
		/>
	)
}
