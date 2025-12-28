import { Suspense, lazy } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Dialog, DialogContent, DialogTitle } from '@/components/dialog';
import { Loading } from '@/components/loading';

import { useDialogStore } from '@/lib/store/dialog';

const UpsertCategory = lazy(() => import('./dialogs/upsert'));
const DeleteCategory = lazy(() => import('./dialogs/delete'));

const categoriesDialogs = ['category-upsert', 'category-delete'];

export function CategoriesDialogManager() {
	const [activeDialog, closeDialog] = useDialogStore(
		useShallow(state => [state.activeDialog, state.closeDialog]),
	);

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
		<Dialog open={true} onOpenChange={open => !open && closeDialog()}>
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
