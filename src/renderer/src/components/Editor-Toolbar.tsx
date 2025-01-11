import { Bold } from 'lucide-react'
import { Toggle } from './ui/toggle'
import React from 'react'
import { useAtom } from 'jotai'
import { ViewAtom } from '@/store'
import { View } from '$shared/types'

export const EditorToolbar = (): React.ReactElement => {
	const [view, setView] = useAtom<View>(ViewAtom)
	return (
		<div className="flex gap-2 items-center p-2">
			<Toggle aria-label="toggle bold" size={'default'} variant={'outline'}>
				<Bold />
			</Toggle>
			<Toggle
				onPressedChange={(pressed) => setView((prev) => (pressed ? View.PREVIEW : prev))}
				defaultPressed={view === View.PREVIEW}
				pressed={view === View.PREVIEW}
				aria-label="Preview"
				size={'default'}
				variant={'outline'}
			>
				<span>Preview</span>
			</Toggle>
			<Toggle
				onPressedChange={(pressed) => setView((prev) => (pressed ? View.SPLIT : prev))}
				defaultPressed={view === View.SPLIT}
				pressed={view === View.SPLIT}
				aria-label="Split View"
				size={'default'}
				variant={'outline'}
			>
				<span>Split</span>
			</Toggle>
			<Toggle
				onPressedChange={(pressed) => setView((prev) => (pressed ? View.EDIT : prev))}
				defaultPressed={view === View.EDIT}
				pressed={view === View.EDIT}
				aria-label="Editor View"
				size={'default'}
				variant={'outline'}
			>
				<span>Editor</span>
			</Toggle>
		</div>
	)
}
