import { useEffect, useState } from 'react'
import './App.css'
import { Logo } from './components/Logo'
import { NavButton } from './components/nav-button'
import Screenshot from '/Screenshot.png'
import { cn } from './utils'

const saveObjectList = [
	{ word: 'Bookmarks' },
	{ word: 'Notes' },
	{ word: 'Saves' },
	{ word: 'Documents' },
	{ word: 'Research' },
	{ word: 'Readings' },
	{ word: 'References' },
	{ word: 'Links' },
	{ word: 'Articles' },
	{ word: 'Journals' },
	{ word: 'Books' },
	{ word: 'Blogs' },
	{ word: 'Ideas' },
	{ word: 'Quotes' },
	{ word: 'Reports' },
	{ word: 'Webpages' },
	{ word: 'Tasks' },
	{ word: 'Thoughts' },
	{ word: 'Insights' },
	{ word: 'Knowledge' },
	{ word: 'Data' },
	{ word: 'Information' },
	{ word: 'Checklists' }
]

function App() {
	const [saveObjectIndex, setSaveObjectIndex] = useState<number>(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setSaveObjectIndex((saveObjectIndex) => (saveObjectIndex + 1) % saveObjectList.length)
		}, 3000)
		return () => clearInterval(interval)
	}, [])

	return (
		<>
			<nav className="nav fixed w-full max-h-fit">
				<div
					className={cn(
						'nav-container',
						'max-w-fit',
						'max-h-fit',
						'mx-auto',
						'pl-5',
						'pr-10',
						'py-1',
						'rounded-2xl',
						'text-foreground',
						'border',
						'border-solid',
						'border-border',
						'grid',
						'lg:grid-cols-3',
						'xl:grid-cols-3',
						'md:grid-cols-2',
						'gap-1',
						'place-content-cente',
						'backdrop-blur-sm'
					)}
				>
					<a className="nav-logo-container h-14 min-w-fit" href="/">
						<Logo />
					</a>
					<div className="navbutton-container h-14 max-w-fit mx-auto grow flex justify-center gap-1 rounded-2xl text-foreground">
						<NavButton onClk={() => {}} children={'Home'} />
						<NavButton onClk={() => {}} children={'Features'} />
						<NavButton onClk={() => {}} children={'Repo'} />
					</div>
					<div className="dummy w-14"></div>
				</div>
			</nav>
			<main className="text-foreground mt-20 mx-auto sm:w-full md:w-5xl lg:w-7xl xl:w-7xl flex flex-col">
				<span className="text-center mx-auto mt-36 mb-15 blob">
					<div className="mb-5 text-7xl font-semibold font-space bigglow-green">
						Search like you think
					</div>
					<div className="text-2xl font-space">
						Collect everything you want, then find it when you need it.
					</div>
				</span>
				<div className="mx-auto my-5 mb-40 sm:w-full md:w-5xl lg:w-7xl xl:w-7xl shadow-2xl shadow-violet">
					<img src={Screenshot} alt="Screenshot" />
				</div>
				<div className="text-5xl mx-auto font-space text-center flex flex-col gap-5 mb-10">
					<div>One App</div>
					<div>
						To save all of your{' '}
						<span className="bigglow-red font-bold">{saveObjectList[saveObjectIndex].word}</span>.
					</div>
				</div>
			</main>
		</>
	)
}

export default App
