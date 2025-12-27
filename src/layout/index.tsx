import { type ReactNode } from 'react';

const Layout = ({ children }: { children: ReactNode }) => {
	return (
		<div className="h-screen w-screen overflow-hidden flex flex-col">
			<main className="clickable-content relative flex-1 flex flex-col rounded-lg bg-transparent overflow-auto">
				{children}
			</main>
		</div>
	);
};

export default Layout;
