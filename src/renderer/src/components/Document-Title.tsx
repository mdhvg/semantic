import { ActiveDocumentAtom } from '@/store'
import { useAtom } from 'jotai'
import React, { useState } from 'react'

export const DocumentTitle = (): React.ReactElement => {
	const [isEditing, setIsEditing] = useState(false)
	const [document, setDocument] = useAtom(ActiveDocumentAtom)

	const handleTitleClick = (): void => {
		setIsEditing(true)
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		document && setDocument({ ...document, title: e.currentTarget.value })
	}

	const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			setIsEditing(false)
		}
	}

	return (
		<div className="flex pt-10 pb-4" onClick={handleTitleClick}>
			{isEditing ? (
				<input
					className="font-bold text-5xl outline-none border-none ring-0 leading-none max-h-12 text-foreground bg-background"
					value={document?.title}
					onChange={handleChange}
					onKeyDown={handleTitleKeyDown}
					onBlur={() => setIsEditing(false)}
					autoFocus
				/>
			) : (
				<h1 className="font-bold text-5xl leading-none">{document?.title}</h1>
			)}
		</div>
	)
}
