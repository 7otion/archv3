import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';

import {
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from '@/components/dialog';
import { Button } from '@/components/button';

import { useContentTypesStore } from '@/lib/store/content-types';
import { useDialogStore } from '@/lib/store/dialog';
import { toastError } from '@/lib/utils';

export default function LockToggleContentType() {
	const [isLoading, setIsLoading] = useState(false);

	const [selectedContentType, updateContentType] = useContentTypesStore(
		useShallow(state => [state.selectedItem, state.update]),
	);

	const closeDialog = useDialogStore(state => state.closeDialog);

	const isCurrentlyLocked = selectedContentType?.locked || false;
	const action = isCurrentlyLocked ? 'unlock' : 'lock';
	const actionPast = isCurrentlyLocked ? 'unlocked' : 'locked';

	const handleToggleLock = async () => {
		if (!selectedContentType) return;

		setIsLoading(true);
		try {
			await updateContentType(selectedContentType.id, {
				locked: selectedContentType.locked ? 0 : 1,
			});
			toast.success(
				`"${selectedContentType.name}" has been ${actionPast}`,
			);
			closeDialog();
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
