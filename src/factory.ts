export async function createFirebaseWrapper(type: 'admin' | 'client') {
    if (type === 'admin') {
        const { FirebaseAdminWrapper } = await import('./firebase-admin');
        return new FirebaseAdminWrapper();
    }
    const { FirebaseClientWrapper } = await import('./firebase-client');
    return new FirebaseClientWrapper();
}