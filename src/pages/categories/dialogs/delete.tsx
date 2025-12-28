import { useState } from 'react';
import { toast } from 'sonner';

import {
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from '@/components/dialog';
import { Button } from '@/components/button';

import { useCategoriesStore } from '@/lib/store/categories';
import { useDialogStore } from '@/lib/store/dialog';
import { toastError } from '@/lib/utils';

export default function DeleteCategory() {
	const [isLoading, setIsLoading] = useState(false);

	const selectedCategory = useCategoriesStore(state => state.selectedItem);
	const closeDialog = useDialogStore(state => state.closeDialog);
	const removeCategory = useCategoriesStore(state => state.remove);

	const handleDelete = async () => {
		if (!selectedCategory) return;

		setIsLoading(true);
		try {
			await removeCategory(selectedCategory);
			toast.success(
				`"${selectedCategory.name}" has been deleted successfully`,
			);
			closeDialog();
		} catch (error) {
			toastError(error, 'Failed to delete category');
		} finally {
			setIsLoading(false);
		}
	};

	if (!selectedCategory) {
		return null;
	}

	return (
		<>
			<DialogHeader className="border-b pb-2">
				<DialogTitle>Delete Category</DialogTitle>
				<DialogDescription>
					Are you sure you want to delete&nbsp;
					<span className="text-destructive font-semibold">
						{selectedCategory.name}
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
