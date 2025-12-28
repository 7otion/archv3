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

export default function DeleteContentType() {
	const [isLoading, setIsLoading] = useState(false);

	const [selectedContentType, removeContentType] = useContentTypesStore(
		useShallow(state => [state.selectedItem, state.remove]),
	);

	const closeDialog = useDialogStore(state => state.closeDialog);

	const handleDelete = async () => {
		if (!selectedContentType) return;

		setIsLoading(true);
		try {
			await removeContentType(selectedContentType);
			toast.success(
				`"${selectedContentType.name}" has been deleted successfully`,
			);
			closeDialog();
		} catch (error) {
			toastError(error, 'Failed to delete content type');
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
				<DialogTitle>Delete Content Type</DialogTitle>
				<DialogDescription>
					Are you sure you want to delete&nbsp;
					<span className="text-destructive font-semibold">
						{selectedContentType.name}
					</span>
					? This action cannot be undone.
				</DialogDescription>
			</DialogHeader>
			<div className="flex items-center justify-between">
				<DialogClose asChild>
					<Button variant="outline" disabled={isLoading}>
						Cancel
					</Button>
				</DialogClose>
				<Button
					variant="destructive"
					onClick={handleDelete}
					disabled={isLoading}
				>
					{isLoading ? 'Deleting...' : 'Delete'}
				</Button>
			</div>
		</>
	);
}
