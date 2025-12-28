import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SettingsIcon, ShieldIcon, NetworkIcon, InfoIcon } from 'lucide-react';
import { NativeFileInput } from '@7otion/tauri-file-uploader';

import { Button } from '@/components/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/dialog';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/tabs';
import { Switch } from '@/components/switch';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/select';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/form';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/accordion';

import { Settings as SettingsModel } from '@/lib/models/settings';

const settingsSchema = z.object({
	lock_pwd: z.string().optional(),
	video2x_path: z.string().optional(),
	veracrypt_path: z.string().optional(),
	is_db_encrypted: z.number().min(0).max(1),
	db_encryption_method: z.string().optional(),
	downloads_path: z.string().optional(),
	download_speed_limit: z.number().min(0),
	concurrent_downloads: z.number().min(1),
	update_check_enabled: z.number().min(0).max(1),
	update_check_frequency: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const encryptionMethods = [
	{ value: 'aes-256', label: 'AES-256' },
	{ value: 'chacha20', label: 'ChaCha20' },
	{ value: 'blowfish', label: 'Blowfish' },
];

export function Settings() {
	const [loading, setLoading] = useState(false);

	const form = useForm<SettingsFormData>({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			lock_pwd: '',
			video2x_path: '',
			veracrypt_path: '',
			is_db_encrypted: 0,
			db_encryption_method: 'aes-256',
			downloads_path: '',
			download_speed_limit: 0,
			concurrent_downloads: 1,
			update_check_enabled: 1,
			update_check_frequency: 'daily',
		},
	});

	const { setValue, watch, reset, formState } = form;

	useEffect(() => {
		setLoading(true);
		SettingsModel.get()
			.then(settings => {
				reset({
					lock_pwd: settings.lock_pwd ?? '',
					video2x_path: settings.video2x_path ?? '',
					veracrypt_path: settings.veracrypt_path ?? '',
					is_db_encrypted: settings.is_db_encrypted ?? 0,
					db_encryption_method:
						settings.db_encryption_method ?? 'aes-256',
					downloads_path: settings.downloads_path ?? '',
					download_speed_limit: settings.download_speed_limit ?? 0,
					concurrent_downloads: settings.concurrent_downloads ?? 1,
					update_check_enabled: settings.update_check_enabled ?? 1,
					update_check_frequency:
						settings.update_check_frequency ?? 'daily',
				});
			})
			.finally(() => setLoading(false));
	}, []);

	const onSubmit = async (data: SettingsFormData) => {
		setLoading(true);
		const settings = await SettingsModel.get();
		for (const [key, value] of Object.entries(data)) {
			(settings as any)[key] = value;
		}
		await settings.save();
		setLoading(false);
		form.reset(data);
	};

	// eslint-disable-next-line react-hooks/incompatible-library
	const veracrypt_path = watch('veracrypt_path');
	const video2x_path = watch('video2x_path');

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="clickable-content size-7 px-0"
				>
					<SettingsIcon className="size-[0.9rem]" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-137.5">
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Configure your application preferences and security
						settings.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						className="grid gap-4 w-full overflow-visible"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<Tabs
							defaultValue="security"
							className="h-[60vh] overflow-y-auto overflow-x-hidden"
						>
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="security">
									<ShieldIcon className="mr-2 size-4" />
									Security
								</TabsTrigger>
								<TabsTrigger value="network">
									<NetworkIcon className="mr-2 size-4" />
									Network
								</TabsTrigger>
								<TabsTrigger value="other">
									<InfoIcon className="mr-2 size-4" />
									Other
								</TabsTrigger>
							</TabsList>
							<TabsContent
								value="security"
								className="space-y-6 overflow-y-auto max-h-100 pr-2"
							>
								<Accordion
									type="single"
									collapsible
									className="w-full"
									defaultValue="master-password"
								>
									<AccordionItem value="master-password">
										<AccordionTrigger className="text-pink-400">
											Master Password
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<Label
														className="font-light"
														htmlFor="current-password"
													>
														Current Password
													</Label>
													<Input
														id="current-password"
														type="password"
														placeholder="Enter current password"
														className="w-64"
													/>
												</div>
												<div className="flex items-center justify-between">
													<Label
														className="font-light"
														htmlFor="new-password"
													>
														New Password
													</Label>
													<Input
														id="new-password"
														type="password"
														placeholder="Enter new password"
														className="w-64"
													/>
												</div>
												<div className="flex gap-2 justify-end">
													<Button
														variant="outline"
														size="sm"
													>
														Remove
													</Button>
													<Button size="sm">
														Change
													</Button>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="veracrypt">
										<AccordionTrigger className="text-pink-400">
											VeraCrypt Integration
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-2">
												<div className="flex gap-2">
													<FormField
														control={form.control}
														name="veracrypt_path"
														render={({ field }) => (
															<FormItem className="grid gap-2 grow">
																<FormControl>
																	<Input
																		placeholder="/path/to/veracrypt"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<NativeFileInput
														key={veracrypt_path}
														onFileChange={async folder => {
															setValue(
																'veracrypt_path',
																folder.path,
																{
																	shouldDirty: true,
																},
															);
															return true;
														}}
														dialogTitle="Browse"
														mode="folder"
													/>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="database-encryption">
										<AccordionTrigger className="text-pink-400">
											Database Encryption
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<FormField
														control={form.control}
														name="is_db_encrypted"
														render={({ field }) => (
															<FormItem className="flex items-center justify-between w-full">
																<FormLabel
																	className="font-light"
																	htmlFor="db-encryption"
																>
																	Enable
																	Database
																	Encryption
																</FormLabel>
																<FormControl>
																	<Switch
																		id="db-encryption"
																		checked={
																			!!field.value
																		}
																		onCheckedChange={checked =>
																			field.onChange(
																				checked
																					? 1
																					: 0,
																			)
																		}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
												<div className="flex items-center justify-between">
													<FormField
														control={form.control}
														name="db_encryption_method"
														render={({ field }) => (
															<FormItem className="flex items-center justify-between w-full">
																<FormLabel
																	className="font-light"
																	htmlFor="encryption-method"
																>
																	Encryption
																	Method
																</FormLabel>
																<FormControl>
																	<Select
																		onValueChange={
																			field.onChange
																		}
																		value={
																			field.value
																		}
																	>
																		<SelectTrigger
																			className="w-45"
																			id="encryption-method"
																		>
																			<SelectValue placeholder="AES-256" />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectGroup>
																				{encryptionMethods.map(
																					method => (
																						<SelectItem
																							key={
																								method.value
																							}
																							value={
																								method.value
																							}
																						>
																							{
																								method.label
																							}
																						</SelectItem>
																					),
																				)}
																			</SelectGroup>
																		</SelectContent>
																	</Select>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							</TabsContent>

							<TabsContent value="network">
								<Accordion
									type="single"
									collapsible
									className="w-full"
									defaultValue="download-settings"
								>
									<AccordionItem value="download-settings">
										<AccordionTrigger className="text-pink-400">
											Download Settings
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<FormField
														control={form.control}
														name="downloads_path"
														render={({ field }) => (
															<FormItem className="flex items-center justify-between w-full">
																<FormLabel
																	className="font-light"
																	htmlFor="downloads-path"
																>
																	Downloads
																	Path
																</FormLabel>
																<div className="flex gap-2">
																	<FormControl>
																		<Input
																			id="downloads-path"
																			placeholder="/path/to/downloads"
																			className="w-48"
																			{...field}
																		/>
																	</FormControl>
																	<NativeFileInput
																		key={
																			field.value
																		}
																		onFileChange={async folder => {
																			setValue(
																				'downloads_path',
																				folder.path,
																				{
																					shouldDirty: true,
																				},
																			);
																			return true;
																		}}
																		dialogTitle="Browse"
																		mode="folder"
																	/>
																</div>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
												<div className="flex items-center justify-between">
													<FormField
														control={form.control}
														name="download_speed_limit"
														render={({ field }) => (
															<FormItem className="flex items-center justify-between w-full">
																<FormLabel
																	className="font-light"
																	htmlFor="speed-limit"
																>
																	Download
																	Speed Limit
																	(MB/s)
																</FormLabel>
																<FormControl>
																	<Input
																		id="speed-limit"
																		type="number"
																		placeholder="0"
																		className="w-24"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
												<div className="flex items-center justify-between">
													<FormField
														control={form.control}
														name="concurrent_downloads"
														render={({ field }) => (
															<FormItem className="flex items-center justify-between w-full">
																<FormLabel
																	className="font-light"
																	htmlFor="concurrent-downloads"
																>
																	Concurrent
																	Downloads
																</FormLabel>
																<FormControl>
																	<Input
																		id="concurrent-downloads"
																		type="number"
																		placeholder="3"
																		className="w-24"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="network-options">
										<AccordionTrigger className="text-pink-400">
											Network Options
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<Label
														className="font-light"
														htmlFor="proxy-enabled"
													>
														Enable Proxy
													</Label>
													<Switch id="proxy-enabled" />
												</div>
												<div className="flex items-center justify-between">
													<Label
														className="font-light"
														htmlFor="proxy-address"
													>
														Proxy Address
													</Label>
													<Input
														id="proxy-address"
														placeholder="proxy.example.com:8080"
														className="w-48"
														disabled
													/>
												</div>
												<div className="flex items-center justify-between">
													<Label
														className="font-light"
														htmlFor="timeout"
													>
														Connection Timeout
														(seconds)
													</Label>
													<Input
														id="timeout"
														type="number"
														placeholder="30"
														className="w-24"
													/>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							</TabsContent>

							<TabsContent value="other">
								<Accordion
									type="single"
									collapsible
									className="w-full"
									defaultValue="version-information"
								>
									<AccordionItem value="video2x-integration">
										<AccordionTrigger className="text-pink-400">
											Video2x Integration
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-2">
												<div className="flex gap-2">
													<FormField
														control={form.control}
														name="video2x_path"
														render={({ field }) => (
															<FormItem className="grid gap-2 grow">
																<FormControl>
																	<Input
																		placeholder="/path/to/video2x"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<NativeFileInput
														key={video2x_path}
														onFileChange={async folder => {
															setValue(
																'video2x_path',
																folder.path,
																{
																	shouldDirty: true,
																},
															);
															return true;
														}}
														dialogTitle="Browse"
														mode="folder"
													/>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="version-information">
										<AccordionTrigger className="text-pink-400">
											Version Information
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<Label className="font-light">
														Current Version
													</Label>
													<span className="text-sm text-muted-foreground">
														v2.1.4
													</span>
												</div>
												<div className="flex items-center justify-between">
													<Label className="font-light">
														Build Date
													</Label>
													<span className="text-sm text-muted-foreground">
														May 29, 2025
													</span>
												</div>
												<div className="flex items-center justify-between">
													<Label className="font-light">
														Check for Updates
													</Label>
													<Button
														variant="outline"
														size="sm"
													>
														Check Now
													</Button>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="update-settings">
										<AccordionTrigger className="text-pink-400">
											Update Settings
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<FormField
														control={form.control}
														name="update_check_enabled"
														render={({ field }) => (
															<FormItem className="flex items-center justify-between w-full">
																<FormLabel
																	className="font-light"
																	htmlFor="auto-updates"
																>
																	Automatically
																	Check for
																	Updates
																</FormLabel>
																<FormControl>
																	<Switch
																		id="auto-updates"
																		checked={
																			!!field.value
																		}
																		onCheckedChange={checked =>
																			field.onChange(
																				checked
																					? 1
																					: 0,
																			)
																		}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
												<div className="flex items-center justify-between">
													<FormField
														control={form.control}
														name="update_check_frequency"
														render={({ field }) => (
															<FormItem className="flex items-center justify-between w-full">
																<FormLabel
																	className="font-light"
																	htmlFor="update-frequency"
																>
																	Check
																	Frequency
																</FormLabel>
																<FormControl>
																	<Select
																		onValueChange={
																			field.onChange
																		}
																		value={
																			field.value
																		}
																	>
																		<SelectTrigger
																			className="w-32"
																			id="update-frequency"
																		>
																			<SelectValue placeholder="Weekly" />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectGroup>
																				<SelectItem value="daily">
																					Daily
																				</SelectItem>
																				<SelectItem value="weekly">
																					Weekly
																				</SelectItem>
																				<SelectItem value="monthly">
																					Monthly
																				</SelectItem>
																			</SelectGroup>
																		</SelectContent>
																	</Select>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="cache-management">
										<AccordionTrigger className="text-pink-400">
											Cache Management
										</AccordionTrigger>
										<AccordionContent>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<Label className="font-light">
														Cache Size
													</Label>
													<span className="text-sm text-muted-foreground">
														245.6 MB
													</span>
												</div>
												<div className="flex items-center justify-between">
													<Label className="font-light">
														Last Cleared
													</Label>
													<span className="text-sm text-muted-foreground">
														3 days ago
													</span>
												</div>
												<div className="flex items-center justify-between">
													<Label className="font-light">
														Clear Cache
													</Label>
													<Button
														variant="outline"
														size="sm"
													>
														Clear Now
													</Button>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							</TabsContent>
						</Tabs>
						<Button
							variant="info"
							type="submit"
							disabled={loading || !formState.isDirty}
						>
							{loading ? 'Saving...' : 'Save Settings'}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
