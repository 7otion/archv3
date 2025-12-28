import { Folder, Tag, Database, Package, FileText } from 'lucide-react';

import { Badge } from '@/components/badge';

import type { Dataset } from '@/lib/services/dataset';

interface DatasetCardProps {
	dataset: Dataset;
	isSelected?: boolean;
	onToggleSelection?: (datasetId: string) => void;
}

const DatasetCard = ({
	dataset,
	isSelected = false,
	onToggleSelection,
}: DatasetCardProps) => {
	const handleCardClick = () => {
		onToggleSelection?.(dataset.id);
	};

	return (
		<div
			className={`border rounded-lg p-3 transition-colors cursor-pointer group hover:shadow-sm ${
				isSelected
					? 'bg-primary/5 border-primary hover:bg-primary/10'
					: 'hover:bg-muted/30'
			}`}
			onClick={handleCardClick}
		>
			<div className="space-y-2">
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-start gap-2 flex-1">
						<h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
							{dataset.title}
						</h3>
					</div>
					<Badge
						variant="outline"
						className="text-xs px-2 py-0.5 shrink-0"
					>
						{dataset.version}
					</Badge>
				</div>

				<p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
					{dataset.description}
				</p>

				<div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
					<div className="flex items-center gap-1">
						<Folder className="h-3 w-3 shrink-0" />
						<span className="truncate">
							{dataset.categories_count} categories
						</span>
					</div>
					<div className="flex items-center gap-1">
						<Tag className="h-3 w-3 shrink-0" />
						<span className="truncate">
							{dataset.tags_count} tags
						</span>
					</div>
					<div className="flex items-center gap-1">
						<Database className="h-3 w-3 shrink-0" />
						<span className="truncate">
							{dataset.metadata_attributes_count} attrs
						</span>
					</div>
					<div className="flex items-center gap-1">
						<FileText className="h-3 w-3 shrink-0" />
						<span className="truncate">{dataset.size}</span>
					</div>

					{dataset.demo_data_count > 0 && (
						<div className="flex items-center gap-1">
							<Package className="h-3 w-3" />
							<span>{dataset.demo_data_count} demo items</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default DatasetCard;
