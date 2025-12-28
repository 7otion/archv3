import { Suspense, lazy } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Dialog, DialogContent, DialogTitle } from '@/components/dialog';
import { Loading } from '@/components/loading';

import { useDialogStore } from '@/lib/store/dialog';

const DeleteMetadataAttribute = lazy(() => import('./dialogs/delete'));

const metadataAttributesDialogs = ['metadata-attribute-delete'];

export function MetadataAttributesDialogManager() {
	const [activeDialog, closeDialog] = useDialogStore(
		useShallow(state => [state.activeDialog, state.closeDialog]),
	);

	if (
		!activeDialog ||
		!metadataAttributesDialogs.includes(activeDialog as any)
	) {
		return null;
	}

	const renderDialogContent = () => {
		switch (activeDialog) {
			case 'metadata-attribute-delete':
				return <DeleteMetadataAttribute />;
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
