import './App.css'
import { Logo } from './components/Logo'
import { NavButton } from './components/nav-button'

function App() {
	return (
		<>
			<nav className="nav fixed w-full max-h-fit">
				<div className="nav-container max-w-fit max-h-fit mx-auto pl-5 pr-10 py-1 rounded-2xl text-foreground border border-solid border-border grid grid-cols-3 gap-1 place-content-cente backdrop-blur-sm">
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
				<div className="mx-auto pt-36 pb-5 text-7xl font-semibold font-space bigglow-highlight">
					Search like you think
				</div>
				<div className="mx-auto pb-5 text-2xl font-space">
					Collect everything you want, then find it when you need it.
				</div>
			</main>
		</>
	)
}

export default App
