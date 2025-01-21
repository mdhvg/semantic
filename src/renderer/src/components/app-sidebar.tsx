import * as React from 'react'
import { Command, SearchIcon, Settings2, Trash2 } from 'lucide-react'

import { NavSecondary } from '@/components/nav-secondary'
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail
} from '@/components/ui/sidebar'
import { PreviousDocuments } from './Previous-Documents'
import type { SearchDocument, DocumentSchema } from '$shared/types'
import { useAtom } from 'jotai'
import { CommandAtom, DocumentsAtom, SearchResultsAtom } from '@/store'
import { SidebarSearch } from './Sidebar-Search'
import { defaultDocument } from '@/lib/utils'

// This is sample data.
const data = {
	navSecondary: [
		{
			title: 'Settings',
			url: '#',
			icon: Settings2
		},
		{
			title: 'Trash',
			url: '#',
			icon: Trash2
		}
	]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>): React.ReactElement {
	const [, setDocuments] = useAtom<DocumentSchema[]>(DocumentsAtom)
	const [commandOpen, setCommandOpen] = useAtom<boolean>(CommandAtom)
	const [, setSearchResults] = useAtom<SearchDocument['documents']>(SearchResultsAtom)

	const flipCommandOpen = (): void => {
		setCommandOpen((open) => {
			if (open) {
				setSearchResults([])
				return false
			}
			return true
		})
	}

	React.useEffect(() => {
		window.api.onSearchResult((result) => {
			console.log('search results', result)
			setSearchResults(result.documents)
		})

		console.log('fetching documents')
		window.api.fetchDocuments().then((fetchedDocuments) => {
			setDocuments(fetchedDocuments)
		})

		const down = (e: KeyboardEvent): void => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				flipCommandOpen()
			}
			if (e.key === 'Escape' && commandOpen === true) {
				flipCommandOpen()
			}
		}

		document.addEventListener('keydown', down)
		return (): void => document.removeEventListener('keydown', down)
	}, [])
	return (
		<Sidebar className="border-r-0" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<div>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Command className="size-4" />
								</div>
								<span className="truncate font-semibold">Hello, User</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarSearch />
						<SidebarMenuButton onClick={flipCommandOpen} isActive={commandOpen}>
							<SearchIcon />
							<span>Search</span>
							<p className="ml-auto text-sm text-muted-foreground">
								Press{' '}
								<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
									<span className="text-xs">⌘</span>K
								</kbd>
							</p>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							onClick={() =>
								window.api.newDocument().then((newDocId) => {
									setDocuments((documents) => [...documents, defaultDocument(newDocId)])
								})
							}
						>
							<span>New Document</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				{/* <NavFavorites favorites={data.favorites} /> */}
				{/* <NavWorkspaces workspaces={data.workspaces} /> */}
				<PreviousDocuments />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	)
}
