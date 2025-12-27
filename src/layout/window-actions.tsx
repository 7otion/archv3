import { useCallback } from 'react';
import { XIcon, SquareIcon, MinusIcon } from 'lucide-react';

import { getCurrentWindow } from '@tauri-apps/api/window';

import { Button } from '@/components/button';

import { cn } from '@/lib/utils';

export function WindowActions({ className }: { className?: string }) {
	const appWindow = getCurrentWindow();

	const handleMinimize = useCallback(() => {
		appWindow.minimize();
	}, [appWindow]);

	const handleMaximize = useCallback(() => {
		appWindow.toggleMaximize();
	}, [appWindow]);

	const handleClose = useCallback(() => {
		appWindow.close();
	}, [appWindow]);

	return (
		<div className={cn('flex items-center gap-1', className)}>
			<Button
				variant="ghost"
				className="clickable-content size-7 px-0 rounded-none"
				onClick={handleMinimize}
			>
				<MinusIcon className="size-4" />
			</Button>
			<Button
				variant="ghost"
				className="clickable-content size-7 px-0 rounded-none"
				onClick={handleMaximize}
			>
				<SquareIcon className="size-[0.85rem]" />
			</Button>
			<Button
				variant="ghost"
				className="clickable-content size-7 px-0 rounded-none [&:hover]:bg-red-500! dark:[&:hover]:bg-red-800! hover:text-white"
				onClick={handleClose}
			>
				<XIcon className="size-[0.95rem]" />
			</Button>
		</div>
	);
}
