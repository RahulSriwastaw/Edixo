import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../providers/canvas_provider.dart';

import 'dart:async';

final syncServiceProvider = Provider<SyncService>((ref) => SyncService(ref));
final isLiveSyncingProvider = StateProvider<bool>((ref) => false);

class SyncService {
  final Ref ref;
  WebSocketChannel? _channel;
  Timer? _reconnectTimer;
  String? _lastSessionId;
  bool _isManualDisconnect = false;

  bool get isConnected => _channel != null;
  void Function(Map<String, dynamic>)? onMessageReceived;
  void Function(bool)? onConnectionStateChanged;

  SyncService(this.ref);

  void _setLiveState(bool state) {
    ref.read(isLiveSyncingProvider.notifier).state = state;
    onConnectionStateChanged?.call(state);
  }

  void connect(String sessionId) {
    _lastSessionId = sessionId;
    _isManualDisconnect = false;
    if (_channel != null) return;

    try {
      final wsUrl = Uri.parse('ws://localhost:5000/api/whiteboard/sync?session=$sessionId');
      _channel = WebSocketChannel.connect(wsUrl);
      
      _setLiveState(true);
      print("[SyncService] Connected to $wsUrl");

      _channel!.stream.listen((message) {
        if (onMessageReceived != null) {
          try {
            final data = jsonDecode(message);
            onMessageReceived!(data);
          } catch (e) {
            print("[SyncService] Decode error: $e");
          }
        }
      }, onDone: () {
        print("[SyncService] Connection closed");
        _handleDisconnect();
      }, onError: (e) {
        print("[SyncService] Connection error: $e");
        _handleDisconnect();
      });
    } catch (e) {
      print("[SyncService] Connection failed: $e");
      _handleDisconnect();
    }
  }

  void _handleDisconnect() {
    _channel = null;
    _setLiveState(false);
    
    if (!_isManualDisconnect && _lastSessionId != null) {
      _reconnectTimer?.cancel();
      _reconnectTimer = Timer(const Duration(seconds: 5), () {
        if (_lastSessionId != null) {
          print("[SyncService] Attempting to reconnect...");
          connect(_lastSessionId!);
        }
      });
    }
  }

  void disconnect() {
    _isManualDisconnect = true;
    _lastSessionId = null;
    _reconnectTimer?.cancel();
    _channel?.sink.close();
    _channel = null;
    _setLiveState(false);
  }

  void broadcastStroke(Stroke stroke, int pageIndex) {
    if (_channel == null) return;
    final message = {
      'type': 'add_stroke',
      'pageIndex': pageIndex,
      'stroke': stroke.toJson(),
    };
    _channel!.sink.add(jsonEncode(message));
  }

  void broadcastClearPage(int pageIndex) {
    if (_channel == null) return;
    final message = {
      'type': 'clear_page',
      'pageIndex': pageIndex,
    };
    _channel!.sink.add(jsonEncode(message));
  }
}
