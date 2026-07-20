import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    await adminDb.collection('notifications').add({
      userId,
      title,
      message,
      link: link || null,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}