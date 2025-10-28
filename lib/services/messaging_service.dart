import 'dart:collection';

class Message {
  final String id;
  final String conversationId;
  final String fromUserId;
  final String toUserId;
  final DateTime sentAt;
  final String cipherText; // stored encrypted
  final bool read;

  Message({
    required this.id,
    required this.conversationId,
    required this.fromUserId,
    required this.toUserId,
    required this.sentAt,
    required this.cipherText,
    required this.read,
  });

  Message copyWith({bool? read, String? cipherText}) => Message(
        id: id,
        conversationId: conversationId,
        fromUserId: fromUserId,
        toUserId: toUserId,
        sentAt: sentAt,
        cipherText: cipherText ?? this.cipherText,
        read: read ?? this.read,
      );
}

/// Extremely simple reversible “cipher” for tests (NOT for production).
abstract class Crypto {
  String encrypt(String plain, String key);
  String decrypt(String cipher, String key);
}

class XorCrypto implements Crypto {
  @override
  String encrypt(String plain, String key) {
    final kb = key.codeUnits;
    final pb = plain.codeUnits;
    final out = List<int>.generate(pb.length, (i) => pb[i] ^ kb[i % kb.length]);
    return String.fromCharCodes(out);
  }

  @override
  String decrypt(String cipher, String key) => encrypt(cipher, key);
}

abstract class MessagingRepository {
  Future<void> save(Message m);
  Future<Message?> getById(String id);
  Future<List<Message>> listByConversation(String conversationId);
  Future<void> update(Message m);
}

/// In-memory repository for tests.
class InMemoryMessagingRepository implements MessagingRepository {
  final Map<String, Message> _store = {};

  @override
  Future<void> save(Message m) async {
    _store[m.id] = m;
  }

  @override
  Future<Message?> getById(String id) async => _store[id];

  @override
  Future<List<Message>> listByConversation(String conversationId) async {
    final list = _store.values
        .where((m) => m.conversationId == conversationId)
        .toList()
      ..sort((a, b) => a.sentAt.compareTo(b.sentAt));
    return UnmodifiableListView(list);
  }

  @override
  Future<void> update(Message m) async {
    _store[m.id] = m;
  }
}

class MessagingService {
  final MessagingRepository repo;
  final Crypto crypto;
  final String key;

  MessagingService({required this.repo, required this.crypto, required this.key});

  Future<Message> send({
    required String id,
    required String conversationId,
    required String fromUserId,
    required String toUserId,
    required DateTime sentAt,
    required String plainText,
    required bool fromUserHasAccess,
    required bool toUserHasAccess,
  }) async {
    if (!fromUserHasAccess || !toUserHasAccess) {
      throw StateError('Access denied');
    }
    final text = plainText.trim();
    if (text.isEmpty) {
      throw ArgumentError('Message cannot be empty');
    }
    if (text.length > 2000) {
      throw ArgumentError('Message too long');
    }
    final cipher = crypto.encrypt(text, key);
    final msg = Message(
      id: id,
      conversationId: conversationId,
      fromUserId: fromUserId,
      toUserId: toUserId,
      sentAt: sentAt,
      cipherText: cipher,
      read: false,
    );
    await repo.save(msg);
    return msg;
  }

  /// Returns messages in ascending time order, decrypted.
  Future<List<String>> fetchPlainTexts(String conversationId) async {
    final list = await repo.listByConversation(conversationId);
    return list.map((m) => crypto.decrypt(m.cipherText, key)).toList();
  }

  /// Mark all messages to `userId` as read.
  Future<int> markAsRead({required String conversationId, required String userId}) async {
    final list = await repo.listByConversation(conversationId);
    int changed = 0;
    for (final m in list) {
      if (m.toUserId == userId && !m.read) {
        await repo.update(m.copyWith(read: true));
        changed++;
      }
    }
    return changed;
  }

  Future<int> unreadCount({required String conversationId, required String userId}) async {
    final list = await repo.listByConversation(conversationId);
    return list.where((m) => m.toUserId == userId && !m.read).length;
  }
}
