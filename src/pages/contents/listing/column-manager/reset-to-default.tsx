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

import { useContentsStore } from '@/lib/store/contents';

export const ResetToDefault = () => {
	const resetColumns = useContentsStore(state => state.resetColumns);

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
							resetColumns();
						}}
					>
						Reset
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
