import { Link } from 'wouter';

import { Separator } from '@/components/separator';

import { AppActions } from './app-actions';
import { GeneralSearch } from './general-search';
import { WindowActions } from './window-actions';

export const Header = () => {
	return (
		<div className="app-drag-region flex items-center justify-between border-b ps-2 gap-3">
			<div className="flex items-center gap-2">
				<Link
					to="/"
					className="flex items-center text-lg shrink-0 jost text-pink-300 me-0.5"
				>
					<img src="/vite.svg" className="h-5 me-0.5" />
					ARCHV3
				</Link>
				<div className="shrink-0">
					<AppActions />
				</div>
			</div>

			<div className="flex items-center gap-2 shrink-0">
				<GeneralSearch />
				<Separator orientation="vertical" className="h-7!" />
				<WindowActions />
			</div>
		</div>
	);
};
