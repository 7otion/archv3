import { useShallow } from 'zustand/react/shallow';
import { CloudDownloadIcon, LockIcon, MoveIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/button';

import { useContentTypesStore } from '@/lib/store/content-types';
import { useDialogStore } from '@/lib/store/dialog';
import { cn } from '@/lib/utils';

export const Header = () => {
	const [isDraggable, setDraggable, setSelectedContentType] =
		useContentTypesStore(
			useShallow(state => [
				state.isDraggable,
				state.setDraggable,
				state.setSelected,
			]),
		);

	const openDialog = useDialogStore(state => state.openDialog);

	const handleCreateContentType = () => {
		setSelectedContentType(null);
		openDialog('content-type-upsert');
	};

	const handleToggleDraggable = () => {
		setDraggable(!isDraggable);
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
