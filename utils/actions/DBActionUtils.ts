import type { Logger } from '../Logger';
import { DatabaseException } from '../ExceptionUtility';

export type DatabaseDocument = Record<string, unknown>;
export type DatabaseFilter = Record<string, unknown>;
export type DatabaseUpdate = Record<string, unknown> | Array<Record<string, unknown>>;
export type DatabaseSort = Record<string, 1 | -1>;

export interface DatabaseFindOptions {
    projection?: DatabaseDocument;
    sort?: DatabaseSort;
    skip?: number;
    limit?: number;
}

export interface DatabaseCursor {
    sort?(spec: DatabaseSort): DatabaseCursor;
    skip?(count: number): DatabaseCursor;
    limit?(count: number): DatabaseCursor;
    toArray(): Promise<DatabaseDocument[]>;
}

export interface DatabaseCollection {
    findOne(filter: DatabaseFilter, options?: { projection?: DatabaseDocument }): Promise<DatabaseDocument | null>;
    find(filter: DatabaseFilter, options?: { projection?: DatabaseDocument }): DatabaseCursor | Promise<DatabaseDocument[]>;
    countDocuments(filter?: DatabaseFilter): Promise<number>;
    distinct(field: string, filter?: DatabaseFilter): Promise<unknown[]>;
    aggregate(pipeline: DatabaseDocument[]): DatabaseCursor | Promise<DatabaseDocument[]>;
    insertOne(document: DatabaseDocument): Promise<{ insertedId: unknown }>;
    insertMany(documents: DatabaseDocument[]): Promise<{ insertedCount: number; insertedIds?: Record<number, unknown> }>;
    updateOne(filter: DatabaseFilter, update: DatabaseUpdate): Promise<{ matchedCount: number; modifiedCount: number }>;
    updateMany(filter: DatabaseFilter, update: DatabaseUpdate): Promise<{ matchedCount: number; modifiedCount: number }>;
    replaceOne(filter: DatabaseFilter, replacement: DatabaseDocument): Promise<{ matchedCount: number; modifiedCount: number }>;
    deleteOne(filter: DatabaseFilter): Promise<{ deletedCount: number }>;
    deleteMany(filter: DatabaseFilter): Promise<{ deletedCount: number }>;
}

/**
 * Structural adapter intentionally avoids importing a specific driver.
 * The existing database layer supplies the adapter; this utility never opens
 * or closes connections.
 */
export interface DatabaseAdapter {
    collection(name: string): DatabaseCollection;
}

export interface DBActionUtilsOptions {
    database: DatabaseAdapter;
    logger?: Logger;
}

export class DBActionUtils {
    private readonly database: DatabaseAdapter;
    private readonly logger?: Logger;

    constructor(options: DBActionUtilsOptions) {
        this.database = options.database;
        this.logger = options.logger;
    }

    // =========================================================================
    // READ ACTIONS
    // =========================================================================

    public findOne(collection: string, filter: DatabaseFilter, options?: { projection?: DatabaseDocument }): Promise<DatabaseDocument | null> {
        return this.action('findOne', collection, () => this.collection(collection).findOne(filter, options));
    }

    public async findMany(collection: string, filter: DatabaseFilter, options?: DatabaseFindOptions): Promise<DatabaseDocument[]> {
        return this.action('findMany', collection, async () => {
            const found = await this.collection(collection).find(filter, { projection: options?.projection });

            if (Array.isArray(found)) {
                return this.applyInMemoryOptions(found, options);
            }

            let cursor = found;
            if (options?.sort && cursor.sort) cursor = cursor.sort(options.sort);
            if (options?.skip !== undefined && cursor.skip) cursor = cursor.skip(options.skip);
            if (options?.limit !== undefined && cursor.limit) cursor = cursor.limit(options.limit);
            return cursor.toArray();
        });
    }

    public countDocuments(collection: string, filter: DatabaseFilter = {}): Promise<number> {
        return this.action('countDocuments', collection, () => this.collection(collection).countDocuments(filter));
    }

    public distinct(collection: string, field: string, filter?: DatabaseFilter): Promise<unknown[]> {
        return this.action('distinct', collection, () => this.collection(collection).distinct(field, filter));
    }

    public async aggregate(collection: string, pipeline: DatabaseDocument[]): Promise<DatabaseDocument[]> {
        return this.action('aggregate', collection, async () => {
            const result = await this.collection(collection).aggregate(pipeline);
            return Array.isArray(result) ? result : result.toArray();
        });
    }

    // =========================================================================
    // WRITE ACTIONS
    // =========================================================================

    public async insertOne(collection: string, document: DatabaseDocument): Promise<{ insertedId: unknown }> {
        this.assertNonEmptyDocument(document, 'insertOne');
        return this.action('insertOne', collection, () => this.collection(collection).insertOne(document));
    }

    public async insertMany(
        collection: string,
        documents: DatabaseDocument[]
    ): Promise<{ insertedCount: number; insertedIds?: Record<number, unknown> }> {
        if (documents.length === 0) {
            throw new DatabaseException('insertMany requires at least one document.', {
                context: { operation: 'insertMany', metadata: { collection } }
            });
        }
        documents.forEach((document) => this.assertNonEmptyDocument(document, 'insertMany'));
        return this.action('insertMany', collection, () => this.collection(collection).insertMany(documents));
    }

    public async updateOne(
        collection: string,
        filter: DatabaseFilter,
        update: DatabaseUpdate
    ): Promise<{ matchedCount: number; modifiedCount: number }> {
        this.assertSafeFilter(filter, 'updateOne', collection);
        this.assertNonEmptyUpdate(update, 'updateOne', collection);
        return this.action('updateOne', collection, () => this.collection(collection).updateOne(filter, update));
    }

    public async updateMany(
        collection: string,
        filter: DatabaseFilter,
        update: DatabaseUpdate
    ): Promise<{ matchedCount: number; modifiedCount: number }> {
        this.assertSafeFilter(filter, 'updateMany', collection);
        this.assertNonEmptyUpdate(update, 'updateMany', collection);
        return this.action('updateMany', collection, () => this.collection(collection).updateMany(filter, update));
    }

    public async replaceOne(
        collection: string,
        filter: DatabaseFilter,
        replacement: DatabaseDocument
    ): Promise<{ matchedCount: number; modifiedCount: number }> {
        this.assertSafeFilter(filter, 'replaceOne', collection);
        this.assertNonEmptyDocument(replacement, 'replaceOne');
        return this.action('replaceOne', collection, () => this.collection(collection).replaceOne(filter, replacement));
    }

    public async deleteOne(collection: string, filter: DatabaseFilter): Promise<{ deletedCount: number }> {
        this.assertSafeFilter(filter, 'deleteOne', collection);
        return this.action('deleteOne', collection, () => this.collection(collection).deleteOne(filter));
    }

    public async deleteMany(collection: string, filter: DatabaseFilter): Promise<{ deletedCount: number }> {
        this.assertSafeFilter(filter, 'deleteMany', collection);
        return this.action('deleteMany', collection, () => this.collection(collection).deleteMany(filter));
    }

    // =========================================================================
    // INTERNAL HELPERS
    // =========================================================================

    private collection(name: string): DatabaseCollection {
        if (!name.trim()) {
            throw new DatabaseException('Collection name must not be empty.', {
                context: { operation: 'collection' }
            });
        }
        return this.database.collection(name);
    }

    private applyInMemoryOptions(rows: DatabaseDocument[], options?: DatabaseFindOptions): DatabaseDocument[] {
        let result = [...rows];
        if (options?.sort) {
            const [field, direction] = Object.entries(options.sort)[0] ?? [];
            if (field) {
                result.sort((left, right) => {
                    return this.compareValues(left[field], right[field]) * direction;
                });
            }
        }
        if (options?.skip !== undefined) result = result.slice(options.skip);
        if (options?.limit !== undefined) result = result.slice(0, options.limit);
        return result;
    }

    private compareValues(left: unknown, right: unknown): number {
        if (left === right) return 0;
        if (left === undefined || left === null) return -1;
        if (right === undefined || right === null) return 1;
        if (typeof left === 'number' && typeof right === 'number') return left - right;
        if (left instanceof Date && right instanceof Date) return left.getTime() - right.getTime();

        const leftText = String(left);
        const rightText = String(right);
        if (leftText === rightText) return 0;
        return leftText < rightText ? -1 : 1;
    }

    private assertSafeFilter(filter: DatabaseFilter, operation: string, collection: string): void {
        if (!filter || Object.keys(filter).length === 0) {
            throw new DatabaseException(`${operation} requires a non-empty explicit filter.`, {
                context: { operation, metadata: { collection } }
            });
        }
        for (const [key, value] of Object.entries(filter)) {
            if (value === undefined) {
                throw new DatabaseException(`${operation} filter "${key}" is undefined.`, {
                    context: { operation, metadata: { collection } }
                });
            }
        }
    }

    private assertNonEmptyDocument(document: DatabaseDocument, operation: string): void {
        if (!document || Object.keys(document).length === 0) {
            throw new DatabaseException(`${operation} requires a non-empty document.`, {
                context: { operation }
            });
        }
    }

    private assertNonEmptyUpdate(update: DatabaseUpdate, operation: string, collection: string): void {
        const isEmpty = Array.isArray(update) ? update.length === 0 : Object.keys(update).length === 0;
        if (isEmpty) {
            throw new DatabaseException(`${operation} requires a non-empty update.`, {
                context: { operation, metadata: { collection } }
            });
        }
    }

    private async action<T>(operation: string, collection: string, run: () => Promise<T>): Promise<T> {
        try {
            const result = await run();
            this.logger?.debug(`DB action: ${operation} on ${collection}`);
            return result;
        } catch (error) {
            this.logger?.error(`DB action failed: ${operation} on ${collection}`, { error: this.errorMetadata(error) });
            throw error;
        }
    }

    private errorMetadata(error: unknown): Record<string, unknown> {
        if (error instanceof Error) {
            return { name: error.name, message: error.message, stack: error.stack };
        }
        return { message: String(error) };
    }
}
