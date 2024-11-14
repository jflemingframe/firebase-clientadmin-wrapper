import { FirebaseAdminWrapper } from '../src/firebase-admin';
import { FirebaseClientWrapper } from '../src/firebase-client';
import { setupClientFirestore, setupAdminFirestore } from './setupFirebase';

// Mock the dynamic imports
jest.mock('@firebase/firestore', () => ({
    getFirestore: () => setupClientFirestore()
}));

jest.mock('firebase-admin/firestore', () => ({
    getFirestore: () => setupAdminFirestore()
}));

// Test data interfaces
interface TestUser {
    name: string;
    age: number;
    email: string;
    createdAt: Date;
}

interface TestPost {
    title: string;
    content: string;
    authorId: string;
    createdAt: Date;
}

// Helper function to clear the database between tests
async function clearCollection(wrapper: FirebaseAdminWrapper | FirebaseClientWrapper, collection: string) {
    const docs = await wrapper.getDocuments(collection);
    const promises = docs.map(doc => wrapper.deleteDocument(collection, doc.id));
    await Promise.all(promises);
}

describe('Firebase Wrapper Tests', () => {
    let adminWrapper: FirebaseAdminWrapper;
    let clientWrapper: FirebaseClientWrapper;

    beforeEach(async () => {
        adminWrapper = new FirebaseAdminWrapper();
        clientWrapper = new FirebaseClientWrapper();

        // Clear test collections
        await clearCollection(adminWrapper, 'users');
        await clearCollection(adminWrapper, 'posts');
    });

    describe('Basic CRUD Operations', () => {
        const testUser: TestUser = {
            name: 'John Doe',
            age: 30,
            email: 'john@example.com',
            createdAt: new Date()
        };

        test('should create and retrieve a document', async () => {
            await adminWrapper.setDocument('users', 'user1', testUser);
            const retrieved = await adminWrapper.getDocument<TestUser>('users', 'user1');
            expect(retrieved).toEqual(testUser);
        });

        test('should update a document', async () => {
            await adminWrapper.setDocument('users', 'user1', testUser);
            await adminWrapper.updateDocument<TestUser>('users', 'user1', { age: 31 });

            const updated = await adminWrapper.getDocument<TestUser>('users', 'user1');
            expect(updated?.age).toBe(31);
            expect(updated?.name).toBe(testUser.name);
        });

        test('should delete a document', async () => {
            await adminWrapper.setDocument('users', 'user1', testUser);
            await adminWrapper.deleteDocument('users', 'user1');

            const deleted = await adminWrapper.getDocument('users', 'user1');
            expect(deleted).toBeNull();
        });
    });

    describe('Query Operations', () => {
        const users: TestUser[] = [
            {
                name: 'John Doe',
                age: 25,
                email: 'john@example.com',
                createdAt: new Date('2024-01-01')
            },
            {
                name: 'Jane Smith',
                age: 30,
                email: 'jane@example.com',
                createdAt: new Date('2024-01-02')
            },
            {
                name: 'Bob Johnson',
                age: 35,
                email: 'bob@example.com',
                createdAt: new Date('2024-01-03')
            }
        ];

        beforeEach(async () => {
            // Seed test data
            await Promise.all(users.map((user, index) =>
                adminWrapper.setDocument('users', `user${index + 1}`, user)
            ));
        });

        test('should query with where clause', async () => {
            const result = await adminWrapper.query<TestUser>('users', {
                where: [{
                    field: 'age',
                    operator: '>',
                    value: 28
                }]
            });

            expect(result).toHaveLength(2);
            expect(result.every(user => user.age > 28)).toBe(true);
        });

        test('should query with multiple where clauses', async () => {
            const result = await adminWrapper.query<TestUser>('users', {
                where: [
                    { field: 'age', operator: '>', value: 28 },
                    { field: 'age', operator: '<', value: 32 }
                ]
            });

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Jane Smith');
        });

        test('should query with orderBy', async () => {
            const result = await adminWrapper.query<TestUser>('users', {
                orderBy: [{
                    field: 'age',
                    direction: 'desc'
                }]
            });

            expect(result).toHaveLength(3);
            expect(result[0].age).toBe(35);
            expect(result[2].age).toBe(25);
        });

        test('should query with limit', async () => {
            const result = await adminWrapper.query<TestUser>('users', {
                orderBy: [{ field: 'age', direction: 'asc' }],
                limit: 2
            });

            expect(result).toHaveLength(2);
            expect(result[0].age).toBe(25);
            expect(result[1].age).toBe(30);
        });

        test('should query with startAfter', async () => {
            const firstQuery = await adminWrapper.query<TestUser>('users', {
                orderBy: [{ field: 'age', direction: 'asc' }],
                limit: 2
            });

            const secondQuery = await adminWrapper.query<TestUser>('users', {
                orderBy: [{ field: 'age', direction: 'asc' }],
                startAfter: firstQuery[1].age,
                limit: 2
            });

            expect(secondQuery).toHaveLength(1);
            expect(secondQuery[0].age).toBe(35);
        });
    });

    describe('Client vs Admin Implementation', () => {
        const testUser: TestUser = {
            name: 'Test User',
            age: 25,
            email: 'test@example.com',
            createdAt: new Date()
        };

        test('should yield same results for both implementations', async () => {
            // Create with admin
            await adminWrapper.setDocument('users', 'test1', testUser);

            // Read with client
            const clientResult = await clientWrapper.getDocument<TestUser>('users', 'test1');
            expect(clientResult).toEqual(testUser);

            // Update with client
            await clientWrapper.updateDocument<TestUser>('users', 'test1', { age: 26 });

            // Verify with admin
            const adminResult = await adminWrapper.getDocument<TestUser>('users', 'test1');
            expect(adminResult?.age).toBe(26);
        });
    });
});