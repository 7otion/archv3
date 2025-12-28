import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/button';

import type { ColumnConfig } from './types';

interface SortableColumnItemProps {
	column: ColumnConfig;
	onRemove: () => void;
}

export function SortableColumnItem({
	column,
	onRemove,
}: SortableColumnItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: column.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="flex items-center gap-1 bg-zinc-800/50 border border-zinc-700 rounded ps-2"
		>
			<button
				className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-300 shrink-0"
				{...attributes}
				{...listeners}
			>
				<GripVerticalIcon className="w-5 h-5" />
			</button>

			<div className="flex-1 flex items-center gap-3 min-w-0">
				<span className="text-sm font-medium text-zinc-200 truncate">
					{column.label}
				</span>
			</div>

			<Button
				size="sm"
				variant="ghost"
				className="size-7 p-0 text-zinc-400 hover:text-red-400 shrink-0 rounded-none"
				onClick={onRemove}
			>
				<XIcon className="size-4" />
			</Button>
		</div>
	);
}
