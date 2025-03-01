import Semantic from '/Logo.png'

export const Logo = () => {
	return (
		<div className="flex flex-row items-center gap-2 text-foreground text-2xl">
			<img src={Semantic} className="max-w-14" />
			<div className="glow-highlight">Semantic</div>
		</div>
	)
}
