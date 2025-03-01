import Semantic from '/1024x1024.png'

export const Logo = () => {
	return (
		<div className="flex flex-row items-center gap-2 text-foreground text-2xl shadow-2xl">
			<img src={Semantic} />
			Semantic
		</div>
	)
}
