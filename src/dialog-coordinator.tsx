import { ContentTypesDialogManager } from '@/pages/content-types/dialog-manager';
import { FileDialogManager } from '@/layout/app-actions/file/dialog-manager';

export function DialogCoordinator() {
	return (
		<>
			<ContentTypesDialogManager />
			<FileDialogManager />
		</>
	);
}
