import { Grid2X2Icon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/tooltip';
import { LayoutBreadcrumb } from '@/layout/breadcrumb';

import { useDialogStore } from '@/lib/store/dialog';
import { useContentsStore } from '@/lib/store/contents';

import { ColumnManager } from './column-manager';

export const ContentListToolbar = () => {
	const toggleViewType = useContentsStore(state => state.toggleViewType);
	const viewType = useContentsStore(state => state.viewType);
	const openDialog = useDialogStore(state => state.openDialog);

	return (
		<>
			<div className="flex items-center gap-2 min-w-0">
				<div className="flex items-center gap-2 me-2 go">
					<LayoutBreadcrumb />
				</div>

				<div className="flex items-center gap-2 shrink-0">
					<Tooltip delayDuration={750}>
						<TooltipTrigger asChild>
							<Button
								className="sm:size-7 md:size-9"
								variant="secondary"
								size="icon"
								onClick={() => toggleViewType()}
							>
								<Grid2X2Icon />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Toggle View Type</TooltipContent>
					</Tooltip>

					{viewType === 'table' && <ColumnManager />}

					<Tooltip delayDuration={750}>
						<TooltipTrigger asChild>
							<Button
								className="sm:size-7 md:size-9"
								variant="secondary"
								size="icon"
								onClick={() => openDialog('content-upsert')}
							>
								<PlusIcon />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Add new content</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</>
	);
};
