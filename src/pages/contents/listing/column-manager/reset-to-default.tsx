import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/alert-dialog';
import { Button } from '@/components/button';

import { useStore } from '@/lib/store';
import { ContentsStore } from '@/lib/store/contents';

export const ResetToDefault = () => {
	const store = useStore(ContentsStore);

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="outline" className="mt-4">
					Reset to Default
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Reset Columns</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to reset columns to default
						configuration? This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							store.resetColumns();
						}}
					>
						Reset
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
