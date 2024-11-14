import { createFirebaseWrapper } from "../src/factory";

interface User {
    name: string;
    age: number;
    createdAt: Date;
}

async function example() {
    const firebase = await createFirebaseWrapper(
        typeof window === 'undefined' ? 'admin' : 'client'
    );

    // Get latest 10 users over 18, ordered by creation date
    const users = await firebase.query<User>('users', {
        where: [{
            field: 'age',
            operator: '>=',
            value: 18
        }],
        orderBy: [{
            field: 'createdAt',
            direction: 'desc'
        }],
        limit: 10
    });

    // Pagination example
    const lastUser = users[users.length - 1];
    const nextPage = await firebase.query<User>('users', {
        where: [{
            field: 'age',
            operator: '>=',
            value: 18
        }],
        orderBy: [{
            field: 'createdAt',
            direction: 'desc'
        }],
        startAfter: lastUser.createdAt,
        limit: 10
    });
}