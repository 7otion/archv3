import { useSortable } from '@dnd-kit/sortable';
import { GripVerticalIcon } from 'lucide-react';

import { Button } from '@/components/button';

import type { ContentType } from '@/lib/models/content-type';
import { useStore, useObservable } from '@/lib/store';
import { ContentTypesStore } from '@/lib/store/content-types';
import { cn } from '@/lib/utils';

import ContentTypeCard from './card';

interface DraggableContentTypeCardProps {
	contentType: ContentType;
	itemCount: number;
}

const DraggableContentTypeCard = ({
	contentType,
	itemCount,
}: DraggableContentTypeCardProps) => {
	const contentTypesStore = useStore(ContentTypesStore);
	const isDraggable = useObservable(contentTypesStore.isDraggable);

	return (
		<SortableWrapper id={contentType.id} isDraggable={isDraggable}>
			<ContentTypeCard contentType={contentType} itemCount={itemCount} />
		</SortableWrapper>
	);
};
DraggableContentTypeCard.displayName = 'DraggableContentTypeCard';

interface SortableWrapperProps {
	id: string | number;
	isDraggable: boolean;
	children: React.ReactNode;
}

const SortableWrapper = ({
	id,
	isDraggable,
	children,
}: SortableWrapperProps) => {
	const { attributes, listeners, setNodeRef, isDragging, over, transform } =
		useSortable({
			id,
			disabled: !isDraggable,
		});

	const dragStyle = isDragging
		? {
				transform: `translate3d(${transform?.x || 0}px, ${
					transform?.y || 0
				}px, 0)`,
				zIndex: 50,
				opacity: 0.8,
			}
		: undefined;

	const isOver = over?.id === id;

	return (
		<div
			ref={setNodeRef}
			style={dragStyle}
			className={cn(
				'group/card h-full relative',
				isDragging
					? ''
					: 'transition-[colors,padding] duration-200 ease-in-out',
				isOver ? 'p-3 bg-secondary rounded-lg' : '',
			)}
		>
			{children}

			{isDraggable && (
				<Button
					variant="outline"
					size="icon"
					className="h-7 w-7 backdrop-blur-sm cursor-grab absolute bottom-3 right-3 z-50 active:cursor-grabbing ml-auto"
					{...attributes}
					{...listeners}
				>
					<GripVerticalIcon />
				</Button>
			)}
		</div>
	);
};

export { DraggableContentTypeCard };
