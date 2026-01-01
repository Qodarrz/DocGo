import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:docgo/network/api_urls.dart';
import 'package:docgo/network/api_client.dart';

class ChatScreen extends StatefulWidget {
  final String userId;
  final String chatRoomId;
  final String userType;
  final String doctorName;

  const ChatScreen({
    super.key,
    required this.userId,
    required this.chatRoomId,
    required this.userType,
    this.doctorName = 'Dokter',
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  IO.Socket? socket;
  List<Map<String, dynamic>> messages = [];
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isTyping = false;
  bool _isJoined = false;
  bool _isLoading = true;
  bool _canSend = false;
  bool _socketConnected = false;

  final Set<String> _receivedMessageIds = {};

  @override
  void initState() {
    super.initState();
    _initSocket();
    loadMessages();

    _controller.addListener(() {
      setState(() {
        _canSend = _controller.text.trim().isNotEmpty;
      });
    });
  }

  void _initSocket() {
    try {
      print('🔌 Initializing socket...');

      // Untuk socket_io_client 3.1.3, gunakan config Map biasa
      socket = IO.io(ApiUrls.baseUrl, <String, dynamic>{
        'transports': ['websocket'],
        'autoConnect': false, // Manual connect biar lebih control
        'forceNew': true, // ⭐ PENTING: Buat koneksi baru setiap kali
        'reconnection': true,
        'reconnectionAttempts': 5,
        'reconnectionDelay': 1000,
        'timeout': 10000,
      });

      _setupSocketListeners();

      // Connect manual
      socket?.connect();
    } catch (e) {
      print('🔥 Socket init error: $e');
    }
  }

  void _setupSocketListeners() {
    if (socket == null) return;

    socket!.onConnect((_) {
      print('✅ Socket connected: ${socket!.id}');
      setState(() => _socketConnected = true);
      joinRoom();
    });

    socket!.onConnectError((error) {
      print('🔥 Connect error: $error');
      setState(() => _socketConnected = false);
    });

    socket!.onDisconnect((reason) {
      print('❌ Socket disconnected: $reason');
      setState(() {
        _socketConnected = false;
        _isJoined = false;
      });
    });

    socket!.onReconnect((data) {
      print('🔄 Socket reconnected: $data');
      setState(() => _socketConnected = true);
      joinRoom();
    });

    socket!.onReconnectAttempt((data) {
      print('🔄 Reconnect attempt: $data');
    });

    socket!.onReconnectFailed((data) {
      print('❌ Reconnect failed: $data');
    });

    socket!.onError((error) {
      print('🔥 Socket error: $error');
      setState(() => _socketConnected = false);
    });

    socket!.on('newMessage', (data) {
      print('📨 New message received: ${data.toString()}');
      print('📨 Full data type: ${data.runtimeType}');

      if (data is Map) {
        final msg = Map<String, dynamic>.from(data);
        print('📨 Message details:');
        print('  - id: ${msg['id']}');
        print('  - chatRoomId: ${msg['chatRoomId']}');
        print('  - senderId: ${msg['senderId']}');
        print('  - content: ${msg['content']}');
        print('  - from (field): ${msg['from']}');
        print('  - Expected chatRoomId: ${widget.chatRoomId}');

        // Coba format message sesuai yang diharapkan
        final formattedMsg = _formatSocketMessage(msg);

        if (formattedMsg['chatRoomId'] == widget.chatRoomId) {
          if (!_receivedMessageIds.contains(formattedMsg['id'])) {
            print('✅ Processing message for this room');
            _handleIncomingMessage(formattedMsg);
          } else {
            print('⏭️ Message already processed');
          }
        } else {
          print('🚫 Message for different room: ${formattedMsg['chatRoomId']}');
        }
      } else {
        print('⚠️ Data is not a Map: $data');
      }
    });

    // ... other listeners ...
  }

  Map<String, dynamic> _formatSocketMessage(Map<String, dynamic> socketMsg) {
    // Coba berbagai kemungkinan struktur data dari socket
    final isMe =
        socketMsg['senderId'] == widget.userId ||
        socketMsg['senderType'] == 'USER' ||
        (socketMsg['from'] != null && socketMsg['from'] == 'user');

    final from = isMe ? 'user' : 'doctor';
    final senderName = isMe ? 'Anda' : widget.doctorName;

    return {
      "id": socketMsg['id'] ?? '',
      "text": socketMsg['content'] ?? socketMsg['text'] ?? '',
      "from": from,
      "timestamp":
          socketMsg['createdAt'] ??
          socketMsg['timestamp'] ??
          DateTime.now().toIso8601String(),
      "status": "sent",
      "read": socketMsg['read'] ?? false,
      "senderName": senderName,
      "chatRoomId": socketMsg['chatRoomId'] ?? widget.chatRoomId,
      "senderId": socketMsg['senderId'] ?? widget.userId,
    };
  }

  void _handleIncomingMessage(Map<String, dynamic> msg) {
    print('🔄 Handling incoming message: ${msg['id']}');

    final messageId = msg['id'] ?? '';
    final isMyMessage =
        msg['from'] == 'user' ||
        msg['senderId'] == widget.userId ||
        (messageId.isNotEmpty && messageId.startsWith('temp_'));

    if (messageId.isNotEmpty) {
      _receivedMessageIds.add(messageId);
    }

    final index = messages.indexWhere((m) => m['id'] == messageId);

    if (index != -1) {
      print('📝 Updating existing message');
      setState(() {
        messages[index] = msg;
      });
    } else if (!isMyMessage) {
      print('➕ Adding new message from doctor');
      setState(() {
        messages.add(msg);

        // Sort by timestamp
        messages.sort((a, b) {
          final timeA = DateTime.tryParse(a['timestamp']) ?? DateTime.now();
          final timeB = DateTime.tryParse(b['timestamp']) ?? DateTime.now();
          return timeA.compareTo(timeB);
        });

        // Auto read jika dari dokter
        if (msg['from'] == 'doctor') {
          _markAsRead(messageId);
        }
      });
    } else {
      print('⏭️ Skipping my own message');
    }

    _scrollToBottom();
  }

  void joinRoom() {
    if (_socketConnected && socket != null && !_isJoined) {
      print('🚪 Joining room: ${widget.chatRoomId}');

      socket!.emit('joinRoom', {
        'chatRoomId': widget.chatRoomId,
        'userId': widget.userId,
        'userType': widget.userType,
      });

      setState(() => _isJoined = true);
    }
  }

  Future<void> loadMessages() async {
    try {
      setState(() => _isLoading = true);
      final response = await ApiClient.get('chat/${widget.chatRoomId}');

      if (response['success']) {
        final List data = response['data'];

        _receivedMessageIds.clear();

        setState(() {
          messages = data.map<Map<String, dynamic>>((e) {
            final isMe = e['senderType'] == 'USER';
            final from = isMe ? 'user' : 'doctor';
            final timestamp =
                e['createdAt'] ?? DateTime.now().toIso8601String();
            final messageId = e['id'] ?? '';

            if (messageId.isNotEmpty) {
              _receivedMessageIds.add(messageId);
            }

            return {
              "id": messageId,
              "text": e['content'] ?? '',
              "from": from,
              "timestamp": timestamp,
              "status": "sent",
              "read": e['read'] ?? false,
              "senderName": isMe ? 'Anda' : widget.doctorName,
            };
          }).toList();

          messages.sort((a, b) => a['timestamp'].compareTo(b['timestamp']));
        });

        _scrollToBottom();
      } else {
        _showSnackBar('Gagal memuat pesan: ${response['message']}');
      }
    } catch (e) {
      _showSnackBar('Terjadi kesalahan: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void sendMessage() {
    final text = _controller.text.trim();
    if (text.isEmpty || !_socketConnected) {
      _showSnackBar('Tidak dapat mengirim. Periksa koneksi.');
      return;
    }

    final now = DateTime.now();
    final tempId = 'temp_${now.millisecondsSinceEpoch}_${widget.userId}';

    final localMessage = {
      "id": tempId,
      "text": text,
      "from": 'user',
      "timestamp": now.toIso8601String(),
      "status": "sending",
      "read": false,
      "senderName": 'Anda',
    };

    setState(() => messages.add(localMessage));
    _scrollToBottom();

    socket!.emit('sendMessage', {
      'chatRoomId': widget.chatRoomId,
      'senderId': widget.userId,
      'senderType': 'USER',
      'content': text,
      'tempId': tempId,
    });

    _controller.clear();
    sendTyping(false);
  }


  void sendTyping(bool typing) {
    if (_socketConnected && socket != null) {
      socket!.emit('typing', {
        'chatRoomId': widget.chatRoomId,
        'userId': widget.userId,
        'isTyping': typing,
      });
    }
  }

  void _markAsRead(String messageId) {
    if (_socketConnected && socket != null) {
      socket!.emit('markAsRead', {
        'messageId': messageId,
        'chatRoomId': widget.chatRoomId,
        'userId': widget.userId,
      });
    }
  }
  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), duration: const Duration(seconds: 2)),
    );
  }

  String _formatTime(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      return DateFormat('HH:mm').format(date);
    } catch (e) {
      return '';
    }
  }

  void _reconnectSocket() {
    print('🔄 Manual reconnecting...');

    setState(() {
      _socketConnected = false;
      _isJoined = false;
    });

    if (socket != null) {
      socket!.disconnect();
      socket!.clearListeners();
      socket = null;
    }

    Future.delayed(const Duration(milliseconds: 500), () {
      _initSocket();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(widget.doctorName),
                const SizedBox(width: 8),
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _socketConnected ? Colors.green : Colors.red,
                  ),
                ),
              ],
            ),
            Text(
              _socketConnected ? 'Online' : 'Offline',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: _socketConnected ? Colors.white70 : Colors.orange,
              ),
            ),
          ],
        ),
        centerTitle: false,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: loadMessages),
          IconButton(
            icon: const Icon(Icons.wifi_find),
            onPressed: _reconnectSocket,
            tooltip: 'Reconnect',
          ),
        ],
      ),
      body: Column(
        children: [
          if (!_socketConnected)
            Container(
              padding: const EdgeInsets.all(8),
              color: Colors.orange.shade50,
              child: Row(
                children: [
                  Icon(Icons.wifi_off, color: Colors.orange.shade700, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Koneksi terputus',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.orange.shade700,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: _reconnectSocket,
                    child: Text(
                      'RECONNECT',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.orange.shade700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : messages.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.chat_bubble_outline,
                          size: 64,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Mulai percakapan dengan dokter',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.only(top: 8.0),
                    itemCount: messages.length,
                    itemBuilder: (context, index) =>
                        _chatBubble(messages[index]),
                  ),
          ),
          if (_isTyping) _buildTypingIndicator(),
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _chatBubble(Map<String, dynamic> message) {
    final isMe = message['from'] == 'user';
    final time = _formatTime(message['timestamp']);
    final status = message['status'];
    final isRead = message['read'] ?? false;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
      child: Row(
        mainAxisAlignment: isMe
            ? MainAxisAlignment.end
            : MainAxisAlignment.start,
        children: [
          if (!isMe)
            CircleAvatar(
              backgroundColor: Colors.blue,
              child: Text(
                widget.doctorName.substring(0, 1).toUpperCase(),
                style: const TextStyle(color: Colors.white),
              ),
            ),
          const SizedBox(width: 8),
          Flexible(
            child: Column(
              crossAxisAlignment: isMe
                  ? CrossAxisAlignment.end
                  : CrossAxisAlignment.start,
              children: [
                if (!isMe) ...[
                  Text(
                    message['senderName'] ?? widget.doctorName,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 2),
                ],
                Container(
                  padding: const EdgeInsets.symmetric(
                    vertical: 10,
                    horizontal: 14,
                  ),
                  decoration: BoxDecoration(
                    color: isMe ? Colors.blue : Colors.grey[200],
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: isMe
                          ? const Radius.circular(16)
                          : const Radius.circular(4),
                      bottomRight: isMe
                          ? const Radius.circular(4)
                          : const Radius.circular(16),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 2,
                        offset: const Offset(0, 1),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: isMe
                        ? CrossAxisAlignment.end
                        : CrossAxisAlignment.start,
                    children: [
                      Text(
                        message['text'],
                        style: TextStyle(
                          fontSize: 16,
                          color: isMe ? Colors.white : Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            time,
                            style: TextStyle(
                              fontSize: 10,
                              color: isMe ? Colors.white70 : Colors.grey[600],
                            ),
                          ),
                          if (isMe) ...[
                            const SizedBox(width: 4),
                            Icon(
                              status == 'sending'
                                  ? Icons.access_time
                                  : isRead
                                  ? Icons.done_all
                                  : Icons.done,
                              size: 12,
                              color: isMe ? Colors.white70 : Colors.grey,
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (isMe) const SizedBox(width: 8),
          if (isMe)
            CircleAvatar(
              backgroundColor: Colors.green,
              child: const Text('A', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.blue,
            radius: 16,
            child: Text(
              widget.doctorName.substring(0, 1).toUpperCase(),
              style: const TextStyle(color: Colors.white, fontSize: 12),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  margin: const EdgeInsets.only(right: 4),
                  decoration: const BoxDecoration(
                    color: Colors.grey,
                    shape: BoxShape.circle,
                  ),
                ),
                Container(
                  width: 8,
                  height: 8,
                  margin: const EdgeInsets.only(right: 4),
                  decoration: const BoxDecoration(
                    color: Colors.grey,
                    shape: BoxShape.circle,
                  ),
                ),
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Colors.grey,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 12.0),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        border: Border(
          top: BorderSide(color: Colors.grey.shade300, width: 1.0),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              minLines: 1,
              maxLines: 4,
              onChanged: (text) => sendTyping(text.trim().isNotEmpty),
              onSubmitted: (_) => sendMessage(),
              decoration: InputDecoration(
                hintText: _socketConnected
                    ? 'Ketik pesan...'
                    : 'Tidak terhubung...',
                filled: true,
                fillColor: _socketConnected
                    ? Colors.grey.shade100
                    : Colors.grey.shade200,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24.0),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 12.0,
                ),
              ),
              enabled: _socketConnected,
            ),
          ),
          const SizedBox(width: 8.0),
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: _canSend && _socketConnected
                  ? Colors.blue
                  : Colors.grey.shade300,
            ),
            child: IconButton(
              icon: Icon(
                Icons.send,
                color: _canSend && _socketConnected
                    ? Colors.white
                    : Colors.grey.shade600,
              ),
              onPressed: _canSend && _socketConnected ? sendMessage : null,
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    print('🗑️ Disposing chat screen...');

    if (socket != null) {
      socket!.clearListeners();

      if (_isJoined) {
        socket!.emit('leaveRoom', {
          'chatRoomId': widget.chatRoomId,
          'userId': widget.userId,
        });
      }

      Future.delayed(const Duration(milliseconds: 500), () {
        socket!.disconnect();
      });
    }

    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
