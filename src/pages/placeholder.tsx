import { useLocation } from 'wouter';

function Placeholder() {
	const [location] = useLocation();
	return (
		<div>
			This is a placeholder component for path:
			<b className="block">{location}</b>
		</div>
	);
}

export default Placeholder;
