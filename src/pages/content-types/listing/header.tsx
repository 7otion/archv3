import { CloudDownloadIcon, LockIcon, MoveIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/button';

import { useStore, useObservable } from '@/lib/store';
import { ContentTypesStore } from '@/lib/store/content-types';
import { DialogStore } from '@/lib/store/dialog';
import { cn } from '@/lib/utils';

export const Header = () => {
	const contentTypesStore = useStore(ContentTypesStore);
	const isDraggable = useObservable(contentTypesStore.isDraggable);
	const dialogStore = useStore(DialogStore);

	const handleCreateContentType = () => {
		contentTypesStore.setSelected(null);
		dialogStore.openDialog('content-type-upsert');
	};

	const handleToggleDraggable = () => {
		contentTypesStore.setDraggable(!isDraggable);
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<p className="text-sm">
					Create and manage your content types. Content types define
					the structure of this app.
				</p>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="icon" disabled>
						<CloudDownloadIcon />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleToggleDraggable}
						className={cn(
							isDraggable && 'bg-secondary text-primary',
						)}
					>
						<MoveIcon />
					</Button>
					<Button variant="ghost" size="icon" disabled>
						<LockIcon />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleCreateContentType}
					>
						<PlusIcon />
					</Button>
				</div>
			</div>
		</div>
	);
};
