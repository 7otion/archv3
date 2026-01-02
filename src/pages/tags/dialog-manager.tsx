import { Suspense, lazy } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/dialog';
import { Loading } from '@/components/loading';

import { useStore, useObservable } from '@/lib/store';
import { DialogStore } from '@/lib/store/dialog';

const DeleteTag = lazy(() => import('./dialogs/delete'));

const tagsDialogs = ['tag-delete'];

export function TagsDialogManager() {
	const dialogStore = useStore(DialogStore);
	const activeDialog = useObservable(dialogStore.activeDialog);

	if (!activeDialog || !tagsDialogs.includes(activeDialog as any)) {
		return null;
	}

	const renderDialogContent = () => {
		switch (activeDialog) {
			case 'tag-delete':
				return <DeleteTag />;
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
