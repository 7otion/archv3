import { invoke } from '@tauri-apps/api/core';
import { appConfigDir } from '@tauri-apps/api/path';

import type { File } from '@/lib/models/file';

export interface FolderPage {
	folders: string[];
	total_count: number;
	current_page: number;
}

export class FileIPC {
	/* ──────────────────────────
	 * System / OS integration
	 * ────────────────────────── */

	static openExternalUrl(url: string): Promise<void> {
		return invoke('open_external_url', { url });
	}

	static highlightPath(path: string): Promise<void> {
		return invoke('highlight_path', { file_path: path });
	}

	static getAvailableDisks(): Promise<string[]> {
		return invoke('get_available_disks');
	}

	static getDownloadsDir(): Promise<string> {
		return invoke('get_downloads_dir');
	}

	/* ──────────────────────────
	 * File operations
	 * ────────────────────────── */

	static copyFile(
		sourcePath: string,
		targetFolder: string,
		targetFileName: string,
	): Promise<string> {
		return invoke('copy_file', {
			file_path: sourcePath,
			output_folder: targetFolder,
			output_file_name: targetFileName,
		});
	}

	static trash(path: string): Promise<boolean> {
		return invoke('trash', { path });
	}

	static getFileDetails(path: string): Promise<File> {
		return invoke('file_details', { path });
	}

	/* ──────────────────────────
	 * Directory operations
	 * ────────────────────────── */

	static fetchFiles(
		folderPath: string,
		extensionFilter?: string,
	): Promise<File[]> {
		return invoke('fetch_files', {
			folder_path: folderPath,
			extension_filter: extensionFilter,
		});
	}

	static getFolders(
		path: string,
		page: number = 1,
		perPage: number = 50,
	): Promise<FolderPage> {
		return invoke('get_folders', {
			path,
			page,
			per_page: perPage,
		});
	}

	static getParentPath(path: string): Promise<string | null> {
		return invoke('get_parent_path', { path });
	}

	static getPathSegments(path: string): Promise<string[]> {
		return invoke('get_path_segments', { path });
	}

	static async coverFolderPath() {
		const appConfigDirPath = await appConfigDir();
		const coverFolderPath = `${appConfigDirPath}/covers`;
		return coverFolderPath;
	}
}
