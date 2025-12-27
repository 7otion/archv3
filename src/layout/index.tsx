import { type ReactNode } from 'react';

import { Header } from './header';
import { Dock } from './dock';

const Layout = ({ children }: { children: ReactNode }) => {
	return (
		<div className="h-screen w-screen overflow-hidden flex flex-col">
			<Header />
			<main className="clickable-content relative flex-1 flex flex-col rounded-lg bg-transparent overflow-auto">
				{children}
				<Dock />
			</main>
		</div>
	);
};

export default Layout;
