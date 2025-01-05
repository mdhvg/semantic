import { DocumentSchema } from '$shared/types'
import { useAtom, useAtomValue } from 'jotai'
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from './ui/sidebar'
import { ActiveDocumentIDAtom, DocumentsAtom } from '@/store'

export function PreviousDocuments() {
	// const documents: DocumentSchema[] = [
	// 	{
	// 		document_id: 1,
	// 		title: 'Document 1',
	// 		mime: 'text/plain',
	// 		deleted: false,
	// 		deleted_time_left: 0
	// 	},
	// 	{
	// 		document_id: 2,
	// 		title: 'Document 2',
	// 		mime: 'text/plain',
	// 		deleted: false,
	// 		deleted_time_left: 0
	// 	},
	// 	{
	// 		document_id: 3,
	// 		title: 'Document 3',
	// 		mime: 'text/plain',
	// 		deleted: false,
	// 		deleted_time_left: 0
	// 	}
	// ]
	const documents = useAtomValue<DocumentSchema[]>(DocumentsAtom)
	const [activeDocument, setActiveDocument] = useAtom<number | null>(ActiveDocumentIDAtom)

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Documents</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{documents.map((document) => {
						return (
							<SidebarMenuItem key={document.document_id}>
								<SidebarMenuButton
									asChild
									onClick={() => setActiveDocument(document.document_id)}
									isActive={document.document_id === activeDocument}
								>
									<span>{document.title}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						)
					})}
					{/* {workspaces.map((workspace) => (
						<Collapsible key={workspace.name}>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<a href="#">
										<span>{workspace.emoji}</span>
										<span>{workspace.name}</span>
									</a>
								</SidebarMenuButton>
								<CollapsibleTrigger asChild>
									<SidebarMenuAction
										className="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
										showOnHover
									>
										<ChevronRight />
									</SidebarMenuAction>
								</CollapsibleTrigger>
								<SidebarMenuAction showOnHover>
									<Plus />
								</SidebarMenuAction>
								<CollapsibleContent>
									<SidebarMenuSub>
										{workspace.pages.map((page) => (
											<SidebarMenuSubItem key={page.name}>
												<SidebarMenuSubButton asChild>
													<a href="#">
														<span>{page.emoji}</span>
														<span>{page.name}</span>
													</a>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										))}
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					))}
					<SidebarMenuItem>
						<SidebarMenuButton className="text-sidebar-foreground/70">
							<MoreHorizontal />
							<span>More</span>
						</SidebarMenuButton>
					</SidebarMenuItem> */}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
