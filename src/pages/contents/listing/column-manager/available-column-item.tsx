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
		<div className="flex items-center justify-between gap-3 bg-zinc-800/30 border border-zinc-700/50 rounded px-2 py-1">
			<div className="flex items-center gap-3 min-w-0 flex-1">
				<span className="text-sm text-zinc-300 truncate">
					{column.label}
				</span>
			</div>

			<Button
				size="sm"
				variant="ghost"
				className="h-8 w-8 p-0 text-zinc-400 hover:text-green-400 shrink-0"
				onClick={onAdd}
			>
				<PlusIcon className="w-4 h-4" />
			</Button>
		</div>
	);
}
