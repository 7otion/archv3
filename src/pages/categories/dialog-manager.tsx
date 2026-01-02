import { Suspense, lazy } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/dialog';
import { Loading } from '@/components/loading';

import { useStore, useObservable } from '@/lib/store';
import { DialogStore } from '@/lib/store/dialog';

const UpsertCategory = lazy(() => import('./dialogs/upsert'));
const DeleteCategory = lazy(() => import('./dialogs/delete'));

const categoriesDialogs = ['category-upsert', 'category-delete'];

export function CategoriesDialogManager() {
	const dialogStore = useStore(DialogStore);
	const activeDialog = useObservable(dialogStore.activeDialog);

	if (!activeDialog || !categoriesDialogs.includes(activeDialog as any)) {
		return null;
	}

	const renderDialogContent = () => {
		switch (activeDialog) {
			case 'category-upsert':
				return <UpsertCategory />;
			case 'category-delete':
				return <DeleteCategory />;
			default:
				return null;
		}
	};

	return (
		<Dialog
			open={true}
			onOpenChange={open => !open && dialogStore.closeDialog()}
		>
			<DialogTitle className="sr-only" />
			<DialogContent
				aria-describedby={undefined}
				className="sm:max-w-125 xl:max-w-150 max-h-[80vh] overflow-visible"
			>
				<Suspense fallback={<Loading />}>
					{renderDialogContent()}
				</Suspense>
			</DialogContent>
		</Dialog>
	);
}
