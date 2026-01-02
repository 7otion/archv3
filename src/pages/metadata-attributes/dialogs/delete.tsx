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
import { DialogStore } from '@/lib/store/dialog';
import { MetadataAttributesStore } from '@/lib/store/metadata-attributes';
import { toastError } from '@/lib/utils';

export default function DeleteMetadataAttribute() {
	const [isLoading, setIsLoading] = useState(false);

	const store = useStore(MetadataAttributesStore);
	const selectedMetadataAttribute = useObservable(store.selectedItem);
	const dialogStore = useStore(DialogStore);

	const handleDelete = async () => {
		if (!selectedMetadataAttribute) return;

		setIsLoading(true);
		try {
			await store.remove(selectedMetadataAttribute);
			toast.success(
				`"${selectedMetadataAttribute.name}" has been deleted successfully`,
			);
			dialogStore.closeDialog();
		} catch (error) {
			toastError(error, 'Failed to delete metadata attribute');
		} finally {
			setIsLoading(false);
		}
	};

	if (!selectedMetadataAttribute) {
		return null;
	}

	return (
		<>
			<DialogHeader className="border-b pb-2">
				<DialogTitle>Delete Metadata Attribute</DialogTitle>
				<DialogDescription>
					Are you sure you want to delete&nbsp;
					<span className="text-destructive font-semibold">
						{selectedMetadataAttribute.name}
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
