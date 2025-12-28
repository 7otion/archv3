import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Package, Loader2 } from 'lucide-react';

import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import {
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/dialog';

import { toastError } from '@/lib/utils';
import { useDialogStore } from '@/lib/store/dialog';
import { DatasetImporter, type Dataset } from '@/lib/services/dataset';

import DatasetCard from './dataset-card';
import { Spinner } from '@/components/spinner';

const ImportDataset = () => {
	const [datasets, setDatasets] = useState<Dataset[]>([]);
	const [loading, setLoading] = useState(true);
	const [importLoading, setImportLoading] = useState(false);

	const [selectedDatasets, setSelectedDatasets] = useState<Set<string>>(
		new Set(),
	);
	const [multiImportDemoData, setMultiImportDemoData] = useState(true);

	const closeDialog = useDialogStore(state => state.closeDialog);

	useEffect(() => {
		loadDatasets();
	}, []);

	const loadDatasets = async () => {
		try {
			setLoading(true);
			const result = await DatasetImporter.fetchDatasets();
			setDatasets(result);
		} catch (error) {
			toastError(error, 'Failed to load datasets');
		} finally {
			setLoading(false);
		}
	};

	const toggleDatasetSelection = (datasetId: string) => {
		const newSelection = new Set(selectedDatasets);
		if (newSelection.has(datasetId)) {
			newSelection.delete(datasetId);
		} else {
			newSelection.add(datasetId);
		}
		setSelectedDatasets(newSelection);
	};

	const handleMultiImport = async () => {
		if (selectedDatasets.size === 0) return;

		try {
			setImportLoading(true);

			const datasetsToImport = datasets.filter(dataset =>
				selectedDatasets.has(dataset.id),
			);

			const importer = new DatasetImporter();
			const result = await importer.importMultipleDatasets(
				datasetsToImport,
				{
					includeDemoData: multiImportDemoData,
				},
			);

			if (result.successful > 0) {
				toast.success(
					`Successfully imported ${result.successful} dataset(s)${multiImportDemoData ? ' with demo data' : ''}!`,
				);
			}

			if (result.failed > 0) {
				result.errors.forEach(error => toast.error(error));
			}

			setSelectedDatasets(new Set());
			closeDialog();
			setTimeout(() => {
				window.location.reload();
			}, 500);
		} catch (error) {
			toastError(error, 'Failed to import datasets. Please try again.');
		} finally {
			setImportLoading(false);
		}
	};

	return (
		<>
			<DialogHeader className="border-b pb-2">
				<div className="flex items-center justify-between">
					<div>
						<DialogTitle className="flex items-center gap-2">
							<Package className="h-5 w-5" />
							Import Datasets
						</DialogTitle>
						<DialogDescription>
							Choose one or more pre-built datasets to jumpstart
							your content organization.
						</DialogDescription>
					</div>
				</div>
			</DialogHeader>

			<div className="mt-1 max-h-[60vh] px-1 sm:max-w-175 lg:max-w-197.5 overflow-y-auto">
				{loading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin mr-2" />
						<span>Loading datasets...</span>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
							{datasets.map(dataset => (
								<DatasetCard
									key={dataset.id}
									dataset={dataset}
									isSelected={selectedDatasets.has(
										dataset.id,
									)}
									onToggleSelection={toggleDatasetSelection}
								/>
							))}

							{datasets.length === 0 && (
								<div className="col-span-full text-center py-8 text-muted-foreground">
									<Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
									<p>No datasets available</p>
									<p className="text-sm">
										Check back later for new dataset
										releases
									</p>
								</div>
							)}
						</div>

						<div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 mt-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-4">
									<span className="text-sm font-medium">
										{selectedDatasets.size} dataset(s)
										selected
									</span>
									<div className="flex items-center space-x-2">
										<Checkbox
											id="multi-import-demo-data"
											checked={multiImportDemoData}
											onCheckedChange={checked =>
												setMultiImportDemoData(
													checked === true,
												)
											}
										/>
										<label
											htmlFor="multi-import-demo-data"
											className="text-sm font-medium cursor-pointer"
										>
											Include demo data
										</label>
									</div>
								</div>
								<Button
									onClick={handleMultiImport}
									disabled={
										selectedDatasets.size === 0 ||
										importLoading
									}
									className="min-w-35"
								>
									{importLoading ? (
										<>
											<Spinner /> Importing...
										</>
									) : (
										'Start Importing'
									)}
								</Button>
							</div>
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default ImportDataset;
