import { useState, useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
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

import { useContentTypesStore } from '@/lib/store/content-types';
import { cn } from '@/lib/utils';

import { DraggableContentTypeCard } from './draggable-card';
import { EmptyResult } from './empty-result';
import { Header } from './header';

export default function ContentTypesPage() {
	const [activeId, setActiveId] = useState<string | number | null>(null);
	const [overId, setOverId] = useState<string | number | null>(null);

	const [
		contentTypes,
		contentTypeCounts,
		isDraggable,
		updateOrder,
		fetchContentTypeCounts,
	] = useContentTypesStore(
		useShallow(state => [
			state.items,
			state.contentTypeCounts,
			state.isDraggable,
			state.updateOrder,
			state.fetchContentTypeCounts,
		]),
	);

	const sensors = useSensors(useSensor(PointerSensor));

	useEffect(() => {
		if (contentTypes.length > 0) {
			fetchContentTypeCounts();
		}
	}, [fetchContentTypeCounts, contentTypes]);

	const handleDragStart = useCallback((event: any) => {
		setActiveId(event.active.id);
	}, []);

	const handleDragOver = useCallback((event: DragOverEvent) => {
		setOverId(event.over?.id || null);
	}, []);

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		setActiveId(null);
		setOverId(null);

		if (active.id !== over?.id) {
			const currentContentTypes = contentTypes;
			const oldIndex = currentContentTypes.findIndex(
				contentType => contentType.id === active.id,
			);
			const overIndex = currentContentTypes.findIndex(
				contentType => contentType.id === over?.id,
			);

			if (oldIndex !== -1 && overIndex !== -1) {
				const newContentTypes = arrayMove(
					currentContentTypes,
					oldIndex,
					overIndex,
				);
				updateOrder(newContentTypes);
			}
		}
	};

	const customCollisionDetection: CollisionDetection = useCallback(args => {
		const intersectionCollisions = rectIntersection(args);

		if (intersectionCollisions.length > 0) {
			const sortedCollisions = intersectionCollisions.sort((a, b) => {
				const rectA = args.droppableRects.get(a.id);
				const rectB = args.droppableRects.get(b.id);
				const pointer = args.pointerCoordinates;

				if (!rectA || !rectB || !pointer) return 0;

				const distanceA = Math.sqrt(
					Math.pow(pointer.x - (rectA.left + rectA.width / 2), 2) +
						Math.pow(pointer.y - (rectA.top + rectA.height / 2), 2),
				);
				const distanceB = Math.sqrt(
					Math.pow(pointer.x - (rectB.left + rectB.width / 2), 2) +
						Math.pow(pointer.y - (rectB.top + rectB.height / 2), 2),
				);

				return distanceA - distanceB;
			});

			return [sortedCollisions[0]];
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
							{contentTypes.map(contentType => (
								<div
									key={`content-type-card-${contentType.id}`}
									className={cn(
										'relative h-96',
										overId === contentType.id &&
											activeId !== contentType.id
											? 'bg-secondary/50 rounded-lg'
											: '',
									)}
								>
									<DraggableContentTypeCard
										contentType={contentType}
										itemCount={
											contentTypeCounts[contentType.id] ||
											0
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
