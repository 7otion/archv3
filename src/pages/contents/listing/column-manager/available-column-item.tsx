import { PlusIcon } from 'lucide-react';

import { Button } from '@/components/button';

import type { ColumnConfig } from './types';

interface AvailableColumnItemProps {
	column: ColumnConfig;
	onAdd: () => void;
}

export function AvailableColumnItem({
	column,
	onAdd,
}: AvailableColumnItemProps) {
	return (
		<div className="flex items-center justify-between bg-zinc-800/30 border border-zinc-700/50 rounded ps-2 gap-1 mb-0">
			<div className="flex items-center gap-3 min-w-0 flex-1">
				<span className="text-xs text-zinc-300 truncate">
					{column.label}
				</span>
			</div>

			<Button
				size="sm"
				variant="ghost"
				className="size-7 p-0 text-zinc-400 hover:text-green-400 shrink-0 rounded-none"
				onClick={onAdd}
			>
				<PlusIcon className="size-4" />
			</Button>
		</div>
	);
}
