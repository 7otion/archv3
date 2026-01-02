import { useState } from 'react';
import { toast } from 'sonner';

import {
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from '@/components/dialog';
import { Button } from '@/components/button';

import { useStore, useObservable } from '@/lib/store';
import { ContentTypesStore } from '@/lib/store/content-types';
import { DialogStore } from '@/lib/store/dialog';
import { toastError } from '@/lib/utils';

export default function LockToggleContentType() {
	const [isLoading, setIsLoading] = useState(false);

	const contentTypesStore = useStore(ContentTypesStore);
	const selectedContentType = useObservable(contentTypesStore.selectedItem);
	const dialogStore = useStore(DialogStore);

	const isCurrentlyLocked = selectedContentType?.locked || false;
	const action = isCurrentlyLocked ? 'unlock' : 'lock';
	const actionPast = isCurrentlyLocked ? 'unlocked' : 'locked';

	const handleToggleLock = async () => {
		if (!selectedContentType) return;

		setIsLoading(true);
		try {
			await contentTypesStore.update(selectedContentType.id, {
				locked: selectedContentType.locked ? 0 : 1,
			});
			toast.success(
				`"${selectedContentType.name}" has been ${actionPast}`,
			);
			dialogStore.closeDialog();
		} catch (error) {
			toastError(error, `Failed to ${action} content type:`);
		} finally {
			setIsLoading(false);
		}
	};

	if (!selectedContentType) {
		return null;
	}

	return (
		<>
			<DialogHeader className="border-b pb-2">
				<DialogTitle>
					{isCurrentlyLocked ? 'Unlock' : 'Lock'} Content Type
				</DialogTitle>
				<DialogDescription>
					Are you sure you want to {action}&nbsp;
					<span className="text-orange-500">
						{selectedContentType.name}
					</span>
					&nbsp;?
					{isCurrentlyLocked
						? ' This will make the content accessible without authentication.'
						: ' This will require authentication to access the content.'}
				</DialogDescription>
			</DialogHeader>
			<div className="flex items-center justify-between">
				<DialogClose asChild>
					<Button variant="outline" disabled={isLoading}>
						Cancel
					</Button>
				</DialogClose>
				<Button
					variant="info"
					onClick={handleToggleLock}
					disabled={isLoading}
				>
					{isLoading
						? `${
								action.charAt(0).toUpperCase() + action.slice(1)
							}ing...`
						: action.charAt(0).toUpperCase() + action.slice(1)}
				</Button>
			</div>
		</>
	);
}
