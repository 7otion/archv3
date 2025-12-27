import { FolderPlusIcon } from 'lucide-react';

export const EmptyResult = () => {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<div className="rounded-full bg-muted p-6 mb-4">
				<FolderPlusIcon className="h-10 w-10 text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold mb-2">No content types yet</h3>
			<p className="text-muted-foreground max-w-sm mb-6">
				Create your first content type to start organizing your content.
			</p>
		</div>
	);
};
