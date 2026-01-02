import { useState, useCallback, useEffect } from 'react';
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragOverEvent,
	type CollisionDetection,
	rectIntersection,
} from '@dnd-kit/core';
import {
	SortableContext,
	rectSortingStrategy,
	arrayMove,
} from '@dnd-kit/sortable';

import { useStore, useObservable } from '@/lib/store';
import { ContentTypesStore } from '@/lib/store/content-types';
import { cn } from '@/lib/utils';

import { DraggableContentTypeCard } from './draggable-card';
import { EmptyResult } from './empty-result';
import { Header } from './header';

export default function ContentTypesPage() {
	const store = useStore(ContentTypesStore);

	const contentTypes = useObservable(store.items);
	const contentTypeCounts = useObservable(store.contentTypeCounts);
	const isDraggable = useObservable(store.isDraggable);

	const [activeId, setActiveId] = useState<string | number | null>(null);
	const [overId, setOverId] = useState<string | number | null>(null);

	const sensors = useSensors(useSensor(PointerSensor));

	useEffect(() => {
		store.fetch();
	}, [store]);

	useEffect(() => {
		if (contentTypes.length > 0) {
			store.fetchContentTypeCounts();
		}
	}, [store, contentTypes.length]);

	const handleDragStart = useCallback((event: any) => {
		setActiveId(event.active.id);
	}, []);

	const handleDragOver = useCallback((event: DragOverEvent) => {
		setOverId(event.over?.id ?? null);
	}, []);

	const handleDragEnd = useCallback(
		async (event: DragEndEvent) => {
			const { active, over } = event;

			setActiveId(null);
			setOverId(null);

			if (!over || active.id === over.id) return;

			const oldIndex = contentTypes.findIndex(ct => ct.id === active.id);
			const newIndex = contentTypes.findIndex(ct => ct.id === over.id);

			if (oldIndex === -1 || newIndex === -1) return;

			const reordered = arrayMove(contentTypes, oldIndex, newIndex);
			await store.updateOrder(reordered);
		},
		[store, contentTypes],
	);

	const customCollisionDetection: CollisionDetection = useCallback(args => {
		const intersections = rectIntersection(args);

		if (intersections.length > 0) {
			const sorted = intersections.sort((a, b) => {
				const rectA = args.droppableRects.get(a.id);
				const rectB = args.droppableRects.get(b.id);
				const pointer = args.pointerCoordinates;

				if (!rectA || !rectB || !pointer) return 0;

				const distA =
					(pointer.x - (rectA.left + rectA.width / 2)) ** 2 +
					(pointer.y - (rectA.top + rectA.height / 2)) ** 2;

				const distB =
					(pointer.x - (rectB.left + rectB.width / 2)) ** 2 +
					(pointer.y - (rectB.top + rectB.height / 2)) ** 2;

				return distA - distB;
			});

			return [sorted[0]];
		}

		return closestCenter(args);
	}, []);

	return (
		<div className="space-y-4 p-4">
			<Header />

			{contentTypes.length > 0 ? (
				<DndContext
					sensors={sensors}
					collisionDetection={customCollisionDetection}
					onDragStart={handleDragStart}
					onDragOver={handleDragOver}
					onDragEnd={handleDragEnd}
				>
					<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
						<SortableContext
							items={contentTypes.map(ct => ct.id)}
							strategy={rectSortingStrategy}
							disabled={!isDraggable}
						>
							{contentTypes.map(ct => (
								<div
									key={ct.id}
									className={cn(
										'relative h-96',
										overId === ct.id && activeId !== ct.id
											? 'bg-secondary/50 rounded-lg'
											: '',
									)}
								>
									<DraggableContentTypeCard
										contentType={ct}
										itemCount={
											contentTypeCounts[ct.id] ?? 0
										}
									/>
								</div>
							))}
						</SortableContext>
					</div>
				</DndContext>
			) : (
				<EmptyResult />
			)}
		</div>
	);
}
