import React from 'react'
import { DocumentSchema, SearchDocument, View } from '$shared/types'
import { useAtom, useAtomValue } from 'jotai'
import {
	ActiveDocumentIDAtom,
	CommandAtom,
	DocumentsAtom,
	SearchResultsAtom,
	ViewAtom
} from '@/store'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '@/components/ui/command'

export function SidebarSearch(): React.ReactElement {
	const [open, setOpen] = useAtom<boolean>(CommandAtom)
	const searchResults = useAtomValue<SearchDocument['documents']>(SearchResultsAtom)
	const documents = useAtomValue<DocumentSchema[]>(DocumentsAtom)
	const [, setActiveDocumentID] = useAtom<number | null>(ActiveDocumentIDAtom)
	const [, setView] = useAtom<View>(ViewAtom)

	const debounce = (func: (query: string) => void, wait: number) => {
		let timeout: NodeJS.Timeout
		return (query: string): void => {
			clearTimeout(timeout)
			timeout = setTimeout(() => func(query), wait)
		}
	}

	const handleSearch = debounce((value: string) => {
		if (value.length === 0 || value.trim().length === 0) return
		console.log(`Searching for: ${value}`)
		window.api.searchDocument(value)
	}, 1000)

	const openAndFocusContent = (content_id: number, document_id: number): void => {
		console.log('Opening and focusing content', content_id, document_id)
		setOpen(false)
		setView(View.PREVIEW)
		setActiveDocumentID(document_id)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger className="absolute left-[50vw]"></PopoverTrigger>
			<PopoverContent className="w-[50vw] max-h-[80vh]">
				<Command shouldFilter={false} className="w-full">
					<CommandInput placeholder="Type a command or search..." onValueChange={handleSearch} />
					<CommandList>
						{searchResults.length === 0 ? (
							<CommandEmpty>No results found.</CommandEmpty>
						) : (
							<CommandGroup heading="Semantic Search">
								{searchResults.map((result) => (
									<CommandItem
										key={result.content_id}
										className="flex items-center"
										onClick={() => {
											openAndFocusContent(result.content_id, result.document_id)
										}}
										onSelect={() => {
											openAndFocusContent(result.content_id, result.document_id)
										}}
									>
										<span>
											{documents.find((doc) => doc.document_id === result.document_id)?.title}
										</span>
										<span className="text-muted-foreground">{`index: ${result.sequence_number}`}</span>
										<span className="ml-auto text-muted-foreground">
											{result.distance.toFixed(2)} match
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
