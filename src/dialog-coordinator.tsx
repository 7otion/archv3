import { ContentTypesDialogManager } from '@/pages/content-types/dialog-manager';
import { FileDialogManager } from '@/layout/app-actions/file/dialog-manager';
import { CategoriesDialogManager } from '@/pages/categories/dialog-manager';

export function DialogCoordinator() {
	return (
		<>
			<ContentTypesDialogManager />
			<FileDialogManager />
			<CategoriesDialogManager />
		</>
	);
}
