import 'package:flutter_test/flutter_test.dart';
import '/Users/pruthatrivedi/Desktop/DocMedaa/frontend/docmedaa_frontend/lib/services/messaging_service.dart'; // adjust import path if needed

void main() {
  late MessagingService svc;
  late InMemoryMessagingRepository repo;
  const key = 'test-key';

  setUp(() {
    repo = InMemoryMessagingRepository();
    svc = MessagingService(repo: repo, crypto: XorCrypto(), key: key);
  });

  test('send stores encrypted, fetch decrypts in order', () async {
    final now = DateTime(2025, 1, 1, 10);
    await svc.send(
      id: 'm1',
      conversationId: 'c1',
      fromUserId: 'patient',
      toUserId: 'doctor',
      sentAt: now,
      plainText: 'Hello doctor, I have a question.',
      fromUserHasAccess: true,
      toUserHasAccess: true,
    );
    await svc.send(
      id: 'm2',
      conversationId: 'c1',
      fromUserId: 'doctor',
      toUserId: 'patient',
      sentAt: now.add(const Duration(minutes: 1)),
      plainText: 'Sure, please share your symptoms.',
      fromUserHasAccess: true,
      toUserHasAccess: true,
    );

    // Ensure it is encrypted in storage.
    final m1 = await repo.getById('m1');
    expect(m1, isNotNull);
    expect(m1!.cipherText, isNot('Hello doctor, I have a question.'));

    // Decrypted fetch returns plain texts in time order.
    final texts = await svc.fetchPlainTexts('c1');
    expect(texts, [
      'Hello doctor, I have a question.',
      'Sure, please share your symptoms.',
    ]);
  });

  test('unread -> markAsRead counts update only for recipient', () async {
    final now = DateTime(2025, 1, 1, 10);
    await svc.send(
      id: 'm1',
      conversationId: 'c1',
      fromUserId: 'patient',
      toUserId: 'doctor',
      sentAt: now,
      plainText: 'Ping 1',
      fromUserHasAccess: true,
      toUserHasAccess: true,
    );
    await svc.send(
      id: 'm2',
      conversationId: 'c1',
      fromUserId: 'patient',
      toUserId: 'doctor',
      sentAt: now.add(const Duration(minutes: 1)),
      plainText: 'Ping 2',
      fromUserHasAccess: true,
      toUserHasAccess: true,
    );

    expect(await svc.unreadCount(conversationId: 'c1', userId: 'doctor'), 2);
    expect(await svc.unreadCount(conversationId: 'c1', userId: 'patient'), 0);

    final changed = await svc.markAsRead(conversationId: 'c1', userId: 'doctor');
    expect(changed, 2);
    expect(await svc.unreadCount(conversationId: 'c1', userId: 'doctor'), 0);
  });

  test('rejects empty or too-long messages', () async {
    final now = DateTime(2025, 1, 1, 10);
    expect(
      () => svc.send(
        id: 'm1',
        conversationId: 'c1',
        fromUserId: 'u1',
        toUserId: 'u2',
        sentAt: now,
        plainText: '   ',
        fromUserHasAccess: true,
        toUserHasAccess: true,
      ),
      throwsArgumentError,
    );

    final big = 'a' * 2001;
    expect(
      () => svc.send(
        id: 'm2',
        conversationId: 'c1',
        fromUserId: 'u1',
        toUserId: 'u2',
        sentAt: now,
        plainText: big,
        fromUserHasAccess: true,
        toUserHasAccess: true,
      ),
      throwsArgumentError,
    );
  });

  test('denies sending if either party lacks access', () async {
    final now = DateTime(2025, 1, 1, 10);
    expect(
      () => svc.send(
        id: 'm1',
        conversationId: 'c1',
        fromUserId: 'patient',
        toUserId: 'doctor',
        sentAt: now,
        plainText: 'Hello',
        fromUserHasAccess: false,
        toUserHasAccess: true,
      ),
      throwsA(isA<StateError>()),
    );
    expect(
      () => svc.send(
        id: 'm2',
        conversationId: 'c1',
        fromUserId: 'patient',
        toUserId: 'doctor',
        sentAt: now,
        plainText: 'Hello',
        fromUserHasAccess: true,
        toUserHasAccess: false,
      ),
      throwsA(isA<StateError>()),
    );
  });
}
