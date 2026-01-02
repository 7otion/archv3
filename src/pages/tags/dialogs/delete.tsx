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
import { TagsStore } from '@/lib/store/tags';
import { DialogStore } from '@/lib/store/dialog';
import { toastError } from '@/lib/utils';

export default function DeleteTag() {
	const [isLoading, setIsLoading] = useState(false);

	const tagsStore = useStore(TagsStore);
	const selectedTag = useObservable(tagsStore.selectedItem);
	const dialogStore = useStore(DialogStore);

	const handleDelete = async () => {
		if (!selectedTag) return;

		setIsLoading(true);
		try {
			await tagsStore.remove(selectedTag);
			toast.success(
				`"${selectedTag.name}" has been deleted successfully`,
			);
			dialogStore.closeDialog();
		} catch (error) {
			toastError(error, 'Failed to delete tag');
		} finally {
			setIsLoading(false);
		}
	};

	if (!selectedTag) {
		return null;
	}

	return (
		<>
			<DialogHeader className="border-b pb-2">
				<DialogTitle>Delete Tag</DialogTitle>
				<DialogDescription>
					Are you sure you want to delete&nbsp;
					<span className="text-destructive font-semibold">
						{selectedTag.name}
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
