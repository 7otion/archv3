import { XIcon, MoreHorizontalIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';

import { Button } from '@/components/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/dropdown-menu';

import { useStore, useObservable } from '@/lib/store';
import { TabsStore, type Tab } from '@/lib/store/tabs';

export function RouterTabs() {
	const [, navigate] = useLocation();

	const tabsStore = useStore(TabsStore);
	const tabs = useObservable(tabsStore.tabs);

	const containerRef = useRef<HTMLDivElement>(null);
	const [maxVisibleTabs, setMaxVisibleTabs] = useState(5);

	useEffect(() => {
		const updateMaxVisible = () => {
			if (!containerRef.current) return;

			const containerWidth = containerRef.current.offsetWidth;
			const charWidth = 8;
			const basePadding = 40;

			let cumulative = 0;
			let max = 0;

			for (let i = 0; i < tabs.length; i++) {
				const titleWidth = Math.min(
					tabs[i].title.length * charWidth,
					96,
				);
				const tabWidth = titleWidth + basePadding;

				cumulative += tabWidth;
				if (cumulative <= containerWidth) {
					max = i + 1;
				} else {
					break;
				}
			}

			setMaxVisibleTabs(Math.max(1, max));
		};

		updateMaxVisible();

		const ro = new ResizeObserver(updateMaxVisible);
		if (containerRef.current) ro.observe(containerRef.current);

		return () => ro.disconnect();
	}, [tabs]);

	const handleTabClick = useCallback(
		(tab: Tab) => {
			tabsStore.activateTab(tab.id);
			navigate(tab.path);
		},
		[tabsStore, navigate],
	);

	const handleTabMiddleClick = useCallback(
		(tab: Tab, e: React.MouseEvent<HTMLDivElement>) => {
			if (e.button !== 1) return;
			e.preventDefault();
			e.stopPropagation();
			tabsStore.removeTab(tab.id);
		},
		[tabsStore],
	);

	const visibleTabs = tabs.slice(0, maxVisibleTabs);
	const overflowTabs = tabs.slice(maxVisibleTabs);

	if (tabs.length < 2) return null;

	return (
		<div
			ref={containerRef}
			className="flex justify-between border-b min-h-7"
		>
			<div className="flex items-center">
				{visibleTabs.map(tab => (
					<div
						key={tab.id}
						className={`
              flex items-center cursor-pointer min-w-0 group
              transition-colors duration-150 ps-3 pe-2 h-full text-xs border-r
              hover:bg-secondary noto-sans
              ${tab.isActive ? 'border-b border-b-pink-400' : 'hover:bg-gray-700'}
            `}
						onClick={() => handleTabClick(tab)}
						onMouseDown={e => handleTabMiddleClick(tab, e)}
					>
						<span className="truncate max-w-24">{tab.title}</span>

						{tab.canClose && tabs.length > 1 && (
							<Button
								variant="ghost"
								size="sm"
								className="ml-1 size-3 p-0 rounded-full hover:text-pink-300"
								onClick={e => {
									e.stopPropagation();
									tabsStore.removeTab(tab.id);
								}}
							>
								<XIcon />
							</Button>
						)}
					</div>
				))}
			</div>

			{overflowTabs.length > 0 && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-none h-7"
						>
							<MoreHorizontalIcon className="size-4" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end">
						{overflowTabs.map(tab => (
							<DropdownMenuItem
								key={tab.id}
								onClick={() => handleTabClick(tab)}
								className="px-2 py-1"
							>
								{tab.title}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
}
