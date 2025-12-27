use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_settings_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lock_pwd TEXT,
                video2x_path TEXT,
                veracrypt_path TEXT,
                is_db_encrypted INTEGER DEFAULT 0 CHECK(is_db_encrypted IN (0, 1)),
                db_encryption_method TEXT CHECK(length(db_encryption_method) <= 50),
                downloads_path TEXT,
                download_speed_limit INTEGER DEFAULT 0 CHECK(download_speed_limit >= 0),
                concurrent_downloads INTEGER DEFAULT 1 CHECK(concurrent_downloads > 0),
                update_check_enabled INTEGER DEFAULT 1 CHECK(update_check_enabled IN (0, 1)),
                update_check_frequency TEXT CHECK(length(update_check_frequency) <= 20) DEFAULT 'daily',
                last_update_check TIMESTAMP,
                last_cache_clear TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_images_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                width INTEGER NOT NULL,
                height INTEGER NOT NULL,
                resolution TEXT CHECK(length(resolution) <= 50) NOT NULL,
                quality INTEGER CHECK(quality IN (320, 480, 720, 1080, 2160, 4320)) NOT NULL,
                format TEXT CHECK(length(format) <= 20) NOT NULL,
                color_space TEXT CHECK(length(color_space) <= 20),
                has_exif INTEGER DEFAULT 0 CHECK(has_exif IN (0, 1)),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_documents_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT,
                line_count INTEGER,
                word_count INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create_videos_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fps REAL NOT NULL,
                duration INTEGER NOT NULL,
                duration_display TEXT NOT NULL,
                resolution TEXT CHECK(length(resolution) <= 50) NOT NULL,
                quality INTEGER CHECK(quality IN (320, 480, 720, 1080, 2160, 4320)) NOT NULL,
                format TEXT CHECK(length(format) <= 20) NOT NULL,
                codec TEXT CHECK(length(codec) <= 50) NOT NULL,
                audio_streams TEXT,
                subtitles TEXT,
                chapters TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create_files_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                path TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                size INTEGER NOT NULL,
                mime TEXT NOT NULL CHECK(length(mime) <= 50),
                extension TEXT NOT NULL CHECK(length(extension) <= 50),
                ctime INTEGER NOT NULL,
                mtime INTEGER NOT NULL,
				file_type TEXT NOT NULL CHECK(file_type IN ('video', 'image', 'binary', 'document', 'other')),
                file_metadata_id INTEGER,
                scrape_url TEXT,
                download_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "create_content_types_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS content_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL CHECK(length(name) <= 255) UNIQUE,
                slug TEXT NOT NULL CHECK(length(slug) <= 255) UNIQUE,
				file_type TEXT NOT NULL DEFAULT 'rectangular' CHECK(file_type IN ('video', 'image', 'binary', 'document', 'other')),
                description TEXT,
                cover TEXT,
                icon TEXT,
                "order" INTEGER,
                pinned INTEGER DEFAULT 0 CHECK(pinned IN (0, 1)) NOT NULL,
                docked INTEGER DEFAULT 0 CHECK(docked IN (0, 1)) NOT NULL,
                locked INTEGER DEFAULT 0 CHECK(locked IN (0, 1)) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "create_categories_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_type_id INTEGER NOT NULL,
                name TEXT NOT NULL CHECK(length(name) <= 255),
                slug TEXT NOT NULL CHECK(length(slug) <= 255),
                description TEXT,
                cover TEXT,
                cover_gif TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(content_type_id, slug),
                FOREIGN KEY (content_type_id) REFERENCES content_types(id) ON DELETE CASCADE
            );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 8,
            description: "create_contents_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS contents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_type_id INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                file_id INTEGER UNIQUE,
                name TEXT NOT NULL CHECK(length(name) <= 255),
                slug TEXT NOT NULL CHECK(length(slug) <= 255),
                description TEXT,
                cover TEXT,
                cover_gif TEXT,
                rating REAL CHECK(rating >= 0 AND rating <= 10) DEFAULT 0.0,
                favorite INTEGER DEFAULT 0 CHECK(favorite IN (0, 1)),
                view_count INTEGER DEFAULT 0,
                last_viewed_at TIMESTAMP,
                source_url TEXT,
                scrape_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(content_type_id, category_id, slug),
                FOREIGN KEY (content_type_id) REFERENCES content_types(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
            );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 9,
            description: "create_metadata_attributes_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS metadata_attributes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_type_id INTEGER NOT NULL,
                name TEXT NOT NULL CHECK(length(name) <= 100),
                slug TEXT NOT NULL CHECK(length(slug) <= 100),
                attribute_type TEXT NOT NULL CHECK(attribute_type IN ('text', 'number', 'date', 'boolean', 'json')),
                "order" INTEGER,
				icon TEXT,
                is_array INTEGER DEFAULT 0 CHECK(is_array IN (0, 1)),
                filterable INTEGER DEFAULT 0 CHECK(filterable IN (0, 1)),
                sortable INTEGER DEFAULT 0 CHECK(sortable IN (0, 1)),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(content_type_id, slug),
                FOREIGN KEY (content_type_id) REFERENCES content_types(id) ON DELETE CASCADE
            );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 10,
            description: "create_metadata_values_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS metadata_values (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_id INTEGER NOT NULL,
                attribute_id INTEGER NOT NULL,
                value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(content_id, attribute_id),
                FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
                FOREIGN KEY (attribute_id) REFERENCES metadata_attributes(id) ON DELETE CASCADE
            );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 11,
            description: "create_tags_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_type_id INTEGER NOT NULL,
                name TEXT NOT NULL CHECK(length(name) <= 100),
                slug TEXT NOT NULL CHECK(length(slug) <= 100),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(content_type_id, slug),
                FOREIGN KEY (content_type_id) REFERENCES content_types(id) ON DELETE CASCADE
            );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 12,
            description: "create_content_tags_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS content_tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_id INTEGER NOT NULL,
                tag_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(content_id, tag_id),
                FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            );
            "#,
            kind: MigrationKind::Up,
        },
    ]
}
