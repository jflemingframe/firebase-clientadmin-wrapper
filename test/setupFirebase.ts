import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    connectFirestoreEmulator,
    type Firestore as ClientFirestore
} from 'firebase/firestore';
import { initializeApp as initializeAdminApp } from 'firebase-admin/app';
import {
    getFirestore as getAdminFirestore,
    type Firestore as AdminFirestore
} from 'firebase-admin/firestore';

let clientDb: ClientFirestore | null = null;
let adminDb: AdminFirestore | null = null;

export function setupClientFirestore(): ClientFirestore {
    if (clientDb) return clientDb;

    const app = initializeApp({
        projectId: 'demo-test-project',
    });

    clientDb = getFirestore(app);
    connectFirestoreEmulator(clientDb, 'localhost', 8080);
    return clientDb;
}

export function setupAdminFirestore(): AdminFirestore {
    if (adminDb) return adminDb;

    process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
    const app = initializeAdminApp({
        projectId: 'demo-test-project',
    });

    adminDb = getAdminFirestore(app);
    return adminDb;
}

export async function teardown(): Promise<void> {
    clientDb = null;
    adminDb = null;
}

beforeAll(() => {
    console.log('🔥 Using Firestore emulator at localhost:8080');
});

afterAll(async () => {
    await teardown();
});