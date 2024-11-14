import type { WhereFilterOp as AdminWhereFilterOp } from 'firebase-admin/firestore';
import type { WhereFilterOp as ClientWhereFilterOp } from '@firebase/firestore';

export interface WhereClause<T extends ClientWhereFilterOp | AdminWhereFilterOp> {
    field: string;
    operator: T;
    value: any;
}

export interface OrderByClause {
    field: string;
    direction: 'asc' | 'desc';
}

export interface QueryOptions<T extends ClientWhereFilterOp | AdminWhereFilterOp> {
    where?: WhereClause<T>[];
    orderBy?: OrderByClause[];
    limit?: number;
    startAfter?: unknown;
}

export interface FirebaseWrapper<
    TFirestore,
    TDocumentSnapshot,
    TQuerySnapshot,
    TDocumentReference,
    TQuery,
    TWhereFilterOp extends ClientWhereFilterOp | AdminWhereFilterOp
> {
    getDocument<T = unknown>(
        collection: string,
        id: string
    ): Promise<T | null>;

    getDocuments<T = unknown>(
        collection: string,
        options?: QueryOptions<TWhereFilterOp>
    ): Promise<T[]>;

    setDocument<T>(
        collection: string,
        id: string,
        data: T
    ): Promise<void>;

    updateDocument<T>(
        collection: string,
        id: string,
        data: Partial<T>
    ): Promise<void>;

    deleteDocument(
        collection: string,
        id: string
    ): Promise<void>;

    query<T = unknown>(
        collection: string,
        options: QueryOptions<TWhereFilterOp>
    ): Promise<T[]>;

    getDocumentSnapshot(
        collection: string,
        id: string
    ): Promise<TDocumentSnapshot>;

    getQuerySnapshot(
        collection: string,
        options?: QueryOptions<TWhereFilterOp>
    ): Promise<TQuerySnapshot>;
}