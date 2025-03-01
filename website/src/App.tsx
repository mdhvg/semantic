import './App.css'
import { Logo } from './components/Logo'
import { NavButton } from './components/nav-button'

function App() {
	return (
		<>
			<div className="nav-container h-24 w-full text-foreground flex flex-row items-center">
				<a className="nav-logo-container h-14 w-14 rounded-full bg-nav mx-5" href="/">
					<Logo />
				</a>
				<div className="navbutton-container h-14 px-5 max-w-fit mx-auto flex justify-center gap-1 rounded-2xl bg-nav text-foreground">
					<NavButton onClk={() => {}} children={'Home'} />
					<NavButton onClk={() => {}} children={'Repo'} />
				</div>
			</div>
			<main className="text-foreground">It works</main>
		</>
	)
}

export default App
