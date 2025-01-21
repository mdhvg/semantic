'use client'

import { cn } from '@/lib/utils'
import {
	ActiveDocumentContentAtom,
	ActiveDocumentIDAtom,
	DocumentContentsAtom,
	FocusAtom,
	ViewAtom
} from '@/store'
import { useAtom, useAtomValue } from 'jotai'
import React, { Fragment, createElement, useEffect, useRef, useState } from 'react'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import rehypeReact from 'rehype-react'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import * as Runtime from 'react/jsx-runtime'
import { View } from '$shared/types'

const createMarkdown = (input: string): React.ReactNode => {
	return unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeRaw)
		.use(rehypeReact, { Fragment: Runtime.Fragment, jsx: Runtime.jsx, jsxs: Runtime.jsxs })
		.processSync(input).result
}

export const MarkdownEditor = (): React.ReactElement => {
	const [content, setContent] = useAtom(ActiveDocumentContentAtom)
	const activeDocument = useAtomValue(ActiveDocumentIDAtom)
	const documentContents = useAtomValue(DocumentContentsAtom)
	const view = useAtomValue<View>(ViewAtom)
	const textAreaRef = useRef<HTMLTextAreaElement>(null)
	const [focus, setFocus] = useAtom<number | null>(FocusAtom)
	const [preview, setPreview] = useState<React.ReactNode[]>([createElement(Fragment)])
	const previewRef = useRef<HTMLDivElement>(null)

	const createEditorAndPreview = (): void => {
		if (activeDocument === null) return
		if (documentContents[activeDocument] === undefined) return
		switch (view) {
			case View.EDIT:
				{
					if (textAreaRef.current !== null) {
						textAreaRef.current.value = content.contentString
					}
				}
				break
			case View.PREVIEW:
				{
					const previewArray: React.ReactNode[] = []
					if (!content.dirty) {
						for (const part of content.content) {
							previewArray.push(
								<span
									className={cn(
										'invisible',
										`content--${part.content_id}`,
										`document--${activeDocument}`,
										'w-0',
										'h-0'
									)}
								></span>
							)
							previewArray.push(createMarkdown(part.content))
						}
					} else {
						previewArray.push(createMarkdown(content.contentString))
					}
					setPreview(previewArray)
				}
				break
			case View.SPLIT:
				{
					if (textAreaRef.current !== null) {
						textAreaRef.current.value = content.contentString
					}
					const previewArray: React.ReactNode[] = []
					if (!content.dirty) {
						for (const part of content.content) {
							previewArray.push(
								<span
									className={cn(
										'hidden',
										`content--${part.content_id}`,
										`document--${activeDocument}`,
										'w-0',
										'h-0'
									)}
								></span>
							)
							previewArray.push(createMarkdown(part.content))
						}
					} else {
						previewArray.push(createMarkdown(content.contentString))
					}
					setPreview(previewArray)
				}
				break
			default:
				break
		}
	}

	useEffect(createEditorAndPreview, [view, content])

	useEffect(() => {
		if (activeDocument !== null) {
			if (documentContents[activeDocument] === undefined) {
				window.api.getDocument(activeDocument).then((fetchedContent) => {
					console.log(fetchedContent)
					setContent(fetchedContent)
				})
			} else {
				setContent(documentContents[activeDocument].contentString)
			}
		}

		setTimeout(() => {
			if (focus !== null) {
				const element = previewRef.current?.querySelector(`.content--${focus}`)
				element?.scrollIntoView()
				console.log(element)
				if (element) {
					const nextElement = element.nextElementSibling
					console.log(nextElement)
					if (nextElement !== null) {
						nextElement.scrollIntoView()
					}
				}
				setFocus(null)
			}
		}, 2000)
	}, [activeDocument])

	return (
		<div
			className={cn(
				view === View.SPLIT ? 'grid' : 'flex',
				view === View.SPLIT ? 'grid-cols-2' : 'flex-col',
				'flex-1',
				'overflow-auto',
				'w-full',
				'h-full',
				'overflow-hidden'
			)}
		>
			{view !== View.PREVIEW && (
				<textarea
					autoFocus
					className={cn(
						view === View.SPLIT && 'w-1/2',
						view === View.EDIT && 'w-full',
						'outline-none',
						'w-full',
						'grow',
						'ring-0',
						'text-foreground',
						'bg-background',
						'resize-none',
						'overflow-y-scroll',
						'p-2'
					)}
					onChange={(e) => setContent(e.target.value)}
					ref={textAreaRef}
				/>
			)}
			{view !== View.EDIT && (
				<div
					className={cn(
						view === View.PREVIEW && 'min-w-full',
						'prose',
						'dark:prose-invert',
						'p-2',
						'text-pretty',
						'break-words',
						'grow',
						'overflow-y-scroll'
					)}
					ref={previewRef}
				>
					{preview.map((element, index) => (
						<Fragment key={index}>{element}</Fragment>
					))}
				</div>
			)}
		</div>
	)
}
