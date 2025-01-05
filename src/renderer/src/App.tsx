import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { MarkdownEditor } from '@/components/Editor'
import { NoteTitle } from '@/components/NoteTitle'
import { useAtomValue } from 'jotai'
import { ActiveDocumentAtom, ActiveDocumentContentAtom } from './store'
import { Separator } from '@/components/ui/separator'
import { Button } from './components/ui/button'
import { Save, Trash2 } from 'lucide-react'
import { ThemeProvider } from './components/theme-provider'

export default function App(): React.ReactElement {
	const document = useAtomValue(ActiveDocumentAtom)
	const content = useAtomValue(ActiveDocumentContentAtom)

	const saveDocument = (): void => {
		document && window.api.saveDocument(document, content)
	}

	const deleteDocument = (): void => {
		document && window.api.deleteDocument(document.document_id)
	}

	return (
		<ThemeProvider>
			<SidebarProvider>
				<AppSidebar side="left" />
				<SidebarInset>
					<header className="flex gap-2 items-center p-2">
						<div className="flex p-2 gap-2 w-full items-center">
							<SidebarTrigger />
							{document && <span>{document.title}</span>}
						</div>
						<div className="flex ml-auto items-center gap-1">
							<Button onClick={saveDocument}>
								<Save />
							</Button>
							<Button onClick={deleteDocument} variant="destructive">
								<Trash2 />
							</Button>
						</div>
					</header>
					{/* {activeDocument !== null ? (
					<Editor />
				) : (
					<main>
						<div className="flex flex-1 flex-col gap-4 px-4 py-10">
							<Button className="rounded-lg flex m-auto w-1/2 h-10">Create New Document</Button>
						</div>
					</main>
				)} */}
					<div className="px-20 h-full">
						<NoteTitle />
						<Separator orientation="horizontal" />
						<MarkdownEditor />
					</div>
				</SidebarInset>
			</SidebarProvider>
		</ThemeProvider>
	)
}
