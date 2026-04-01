import 'dart:convert';
import 'dart:typed_data';

/// Recursively normalises any JS / Hive LinkedMap tree into a Map<String, dynamic>
/// with only Dart core collection types (Map/List/int/double/bool/String).
/// Prevents runtime `LinkedMap<dynamic, dynamic> is not a subtype of Map<String, dynamic>`
/// errors when calling `fromJson` methods on web builds.
Map<String, dynamic> deepCast(dynamic data) {
  dynamic normalize(dynamic value) {
    if (value is Map) {
      return value.map((key, v) => MapEntry(key.toString(), normalize(v)));
    }
    if (value is Iterable) {
      return value.map(normalize).toList();
    }
    if (value is Uint8List) {
      return value.toList(); // JSON encodable
    }
    return value;
  }

  if (data == null) return {};
  final normalised = normalize(data);
  if (normalised is Map) {
    try {
      // JSON round trip to force canonical Map implementation
      final encoded = jsonEncode(normalised);
      return Map<String, dynamic>.from(
        jsonDecode(encoded) as Map<String, dynamic>,
      );
    } catch (_) {
      // If encoding fails (unlikely after _normalize), still return a Map
      return Map<String, dynamic>.from(normalised);
    }
  }
  return {};
}
