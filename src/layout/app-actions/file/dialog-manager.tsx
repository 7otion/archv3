import { Suspense, lazy } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/dialog';
import { Loading } from '@/components/loading';

import { useDialogStore } from '@/lib/store/dialog';

const ImportDataset = lazy(() => import('./import-dataset'));

const fileDialogs = ['import-dataset'] as const;

export function FileDialogManager() {
	const activeDialog = useDialogStore(state => state.activeDialog);
	const closeDialog = useDialogStore(state => state.closeDialog);

	if (!activeDialog || !fileDialogs.includes(activeDialog as any)) {
		return null;
	}

	const renderDialogContent = () => {
		switch (activeDialog) {
			case 'import-dataset':
				return <ImportDataset />;
			default:
				return null;
		}
	};

	return (
		<Dialog open={true} onOpenChange={open => !open && closeDialog()}>
			<DialogTitle className="sr-only" />
			<DialogContent
				aria-describedby={undefined}
				className="sm:max-w-175 lg:max-w-200 xl:max-w-225 max-h-[80vh] overflow-visible"
			>
				<Suspense fallback={<Loading />}>
					{renderDialogContent()}
				</Suspense>
			</DialogContent>
		</Dialog>
	);
}
