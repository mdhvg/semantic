import { MouseEventHandler } from 'react'

export const NavButton = ({
	onClk,
	children
}: {
	onClk: MouseEventHandler<HTMLButtonElement>
	children: React.ReactNode
}) => {
	return (
		<div className="nav-button px-5">
			<button onClick={onClk} className="w-full h-full">
				{children}
			</button>
		</div>
	)
}
