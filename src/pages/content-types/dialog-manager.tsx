import { Suspense, lazy } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Dialog, DialogContent, DialogTitle } from '@/components/dialog';
import { Loading } from '@/components/loading';

import { useDialogStore } from '@/lib/store/dialog';

const UpsertContentType = lazy(() => import('./dialogs/upsert-content-type'));
const LockToggleContentType = lazy(() => import('./dialogs/lock-toggle'));
const DeleteContentType = lazy(() => import('./dialogs/delete'));

const contentTypesDialogs = [
	'content-type-upsert',
	'content-type-lock-toggle',
	'content-type-delete',
];

export function ContentTypesDialogManager() {
	const [activeDialog, closeDialog] = useDialogStore(
		useShallow(state => [state.activeDialog, state.closeDialog]),
	);

	if (!activeDialog || !contentTypesDialogs.includes(activeDialog as any)) {
		return null;
	}

	const renderDialogContent = () => {
		switch (activeDialog) {
			case 'content-type-upsert':
				return <UpsertContentType />;
			case 'content-type-lock-toggle':
				return <LockToggleContentType />;
			case 'content-type-delete':
				return <DeleteContentType />;
			default:
				return null;
		}
	};

	return (
		<Dialog open={true} onOpenChange={open => !open && closeDialog()}>
			<DialogTitle className="sr-only" />
			<DialogContent
				aria-describedby={undefined}
				className="sm:max-w-175 xl:max-w-200 max-h-[80vh] overflow-visible"
			>
				<Suspense fallback={<Loading />}>
					{renderDialogContent()}
				</Suspense>
			</DialogContent>
		</Dialog>
	);
}
