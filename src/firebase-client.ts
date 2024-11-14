import type { WhereFilterOp as ClientWhereFilterOp } from '@firebase/firestore';
import { QueryOptions } from './types';

export class FirebaseClientWrapper {
    private db: any;
    private initialized: Promise<void>;

    constructor() {
        this.initialized = this.initialize();
    }

    private async initialize() {
        const { getFirestore } = await import('@firebase/firestore');
        this.db = getFirestore();
    }

    async getDocument<T>(collection: string, id: string): Promise<T | null> {
        await this.initialized;
        const doc = await this.getDocumentSnapshot(collection, id);
        return (doc.exists() ? doc.data() : null) as T | null;
    }

    async getDocuments<T>(
        collection: string,
        options?: QueryOptions<ClientWhereFilterOp>
    ): Promise<T[]> {
        await this.initialized;
        const snapshot = await this.getQuerySnapshot(collection, options);
        return snapshot.docs.map(doc => doc.data() as T);
    }

    async setDocument<T>(collection: string, id: string, data: T): Promise<void> {
        await this.initialized;
        await this.db.collection(collection).doc(id).set(data);
    }

    async updateDocument<T>(
        collection: string,
        id: string,
        data: Partial<T>
    ): Promise<void> {
        await this.initialized;
        await this.db.collection(collection).doc(id).update(data);
    }

    async deleteDocument(collection: string, id: string): Promise<void> {
        await this.initialized;
        await this.db.collection(collection).doc(id).delete();
    }

    async query<T>(
        collection: string,
        options: QueryOptions<ClientWhereFilterOp>
    ): Promise<T[]> {
        await this.initialized;
        return this.getDocuments<T>(collection, options);
    }

    async getDocumentSnapshot(collection: string, id: string) {
        await this.initialized;
        return this.db.collection(collection).doc(id).get();
    }

    async getQuerySnapshot(
        collection: string,
        options?: QueryOptions<ClientWhereFilterOp>
    ) {
        await this.initialized;
        let query = this.db.collection(collection);

        if (options?.where) {
            options.where.forEach(clause => {
                query = query.where(clause.field, clause.operator, clause.value);
            });
        }

        if (options?.orderBy) {
            options.orderBy.forEach(clause => {
                query = query.orderBy(clause.field, clause.direction);
            });
        }

        if (options?.startAfter) {
            query = query.startAfter(options.startAfter);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        return query.get();
    }
}