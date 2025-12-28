import { useMemo } from 'react';
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BlocksIcon, Columns3Icon } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/tooltip';
import { Button } from '@/components/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/dialog';

import { useContentsStore } from '@/lib/store/contents';

import { AvailableColumnItem } from './available-column-item';
import { SortableColumnItem } from './sortable-column-item';
import { ResetToDefault } from './reset-to-default';

export function ColumnManager() {
	const [columns, addColumn, removeColumn, reorderColumn] = useContentsStore(
		useShallow(state => [
			state.columns,
			state.addColumn,
			state.removeColumn,
			state.reorderColumn,
		]),
	);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const visibleColumns = useMemo(
		() =>
			columns
				.filter(col => col.visible)
				.sort((a, b) => a.order - b.order),
		[columns],
	);

	const availableColumns = useMemo(
		() =>
			columns
				.filter(col => !col.visible)
				.sort((a, b) => a.id.localeCompare(b.id)),
		[columns],
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = visibleColumns.findIndex(c => c.id === active.id);
			const newIndex = visibleColumns.findIndex(c => c.id === over.id);

			if (oldIndex !== -1 && newIndex !== -1) {
				reorderColumn(active.id as string, newIndex);
			}
		}
	};

	const handleAddColumn = (columnId: string) => {
		addColumn(columnId);
	};

	const handleRemoveColumn = (columnId: string) => {
		removeColumn(columnId);
	};

	return (
		<Dialog>
			<Tooltip delayDuration={750}>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button
							className="sm:size-7 md:size-9"
							variant="secondary"
						>
							<Columns3Icon />
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>Manage Columns</TooltipContent>
			</Tooltip>
			<DialogContent className="sm:max-w-175 lg:max-w-200 xl:max-w-225 max-h-[75vh] overflow-y-auto">
				<DialogHeader className="border-b pb-2">
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle className="flex items-center gap-2">
								<BlocksIcon className="h-5 w-5" />
								Manage Table Columns
							</DialogTitle>
							<DialogDescription className="mt-2">
								Add, remove, or reorder columns. Drag to reorder
								visible columns.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="flex-1 grid grid-cols-2 gap-6">
					<div className="flex flex-col min-h-0">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-sm font-semibold text-zinc-300">
								Available Columns
							</h3>
						</div>
						<div className="flex-1 space-y-2 overflow-y-auto pr-2 min-h-0">
							{availableColumns.length === 0 ? (
								<div className="flex items-center justify-center h-32 text-sm text-zinc-500">
									All columns are currently visible
								</div>
							) : (
								availableColumns.map(column => (
									<AvailableColumnItem
										key={column.id}
										column={column}
										onAdd={() => handleAddColumn(column.id)}
									/>
								))
							)}
						</div>
					</div>

					<div className="flex flex-col min-h-0">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-sm font-semibold text-zinc-300">
								Visible Columns
							</h3>
						</div>
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<div className="flex-1 overflow-y-auto pr-2 min-h-0">
								<SortableContext
									items={visibleColumns.map(c => c.id)}
									strategy={verticalListSortingStrategy}
								>
									<div className="space-y-2">
										{visibleColumns.map(column => (
											<SortableColumnItem
												key={column.id}
												column={column}
												onRemove={() =>
													handleRemoveColumn(
														column.id,
													)
												}
											/>
										))}
									</div>
								</SortableContext>
							</div>
						</DndContext>
					</div>
				</div>
				<ResetToDefault />
			</DialogContent>
		</Dialog>
	);
}
