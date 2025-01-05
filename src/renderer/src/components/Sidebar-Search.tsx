import React from 'react'
import { SearchDocument } from '$shared/types'
import { useAtom, useAtomValue } from 'jotai'
import { CommandAtom, SearchResultsAtom } from '@/store'
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
									<CommandItem key={result.document_id} className="flex items-center">
										<span>{result.title}</span>
										<span className="ml-auto text-muted-foreground">
											{(result.distance * 100).toFixed(2)}% Match
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
