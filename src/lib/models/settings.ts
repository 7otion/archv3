import { Model, getRepository } from '@7otion/orm';

export class Settings extends Model<Settings> {
	static config = {
		table: 'settings',
		primaryKey: 'id',
		timestamps: true,
	};

	id!: number;
	lock_pwd!: string | null;
	video2x_path!: string | null;
	veracrypt_path!: string | null;
	is_db_encrypted!: number;
	db_encryption_method!: string | null;
	downloads_path!: string | null;
	download_speed_limit!: number;
	concurrent_downloads!: number;
	update_check_enabled!: number;
	update_check_frequency!: string | null;
	last_update_check!: string | null;
	last_cache_clear!: string | null;
	created_at!: string;
	updated_at!: string;

	private static _instance: Settings | null = null;

	static async get(): Promise<Settings> {
		if (this._instance) {
			return this._instance;
		}

		const repo = getRepository(Settings);
		let settings = await repo.query().first();

		if (!settings) {
			settings = await repo.create({
				lock_pwd: null,
				video2x_path: null,
				veracrypt_path: null,
				is_db_encrypted: 0,
				db_encryption_method: null,
				downloads_path: null,
				download_speed_limit: 0,
				concurrent_downloads: 1,
				update_check_enabled: 1,
				update_check_frequency: 'daily',
				last_update_check: null,
				last_cache_clear: null,
			});
		}

		this._instance = settings;
		return settings;
	}

	protected override async update(): Promise<this> {
		const result = await super.update();
		Settings._instance = null;
		return result;
	}

	get isDbEncrypted(): boolean {
		return this.is_db_encrypted === 1;
	}

	get isUpdateCheckEnabled(): boolean {
		return this.update_check_enabled === 1;
	}

	get downloadSpeedLimitMBps(): number {
		return this.download_speed_limit / (1024 * 1024);
	}

	get isLocked(): boolean {
		return this.lock_pwd !== null && this.lock_pwd.length > 0;
	}
}
