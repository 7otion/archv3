import { useLocation } from 'wouter';

import { Button } from '@/components/button';

export const EmptyResult = () => {
	const [, navigate] = useLocation();
	const handleGoBack = () => {
		navigate('/');
	};
	return (
		<div className="flex flex-col items-center justify-center h-64 space-y-4">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
					Content Type Not Found
				</h2>
				<p className="text-gray-600 dark:text-gray-400 mt-2">
					The content type you're looking for doesn't exist or
					couldn't be loaded.
				</p>
			</div>
			<Button onClick={handleGoBack} variant="outline">
				Go Back to Content Types
			</Button>
		</div>
	);
};
