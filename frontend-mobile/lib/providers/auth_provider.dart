import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthProvider with ChangeNotifier {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  bool _isAuthenticated = false;
  bool _isLoading = true;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  AuthProvider() {
    loadFromStorage();
  }

  Future<void> loadFromStorage() async {
    String? token = await _storage.read(key: 'lexaid_token');
    if (token != null && token.isNotEmpty) {
      _isAuthenticated = true;
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> login(String token) async {
    await _storage.write(key: 'lexaid_token', value: token);
    _isAuthenticated = true;
    notifyListeners();
  }

  Future<void> logout() async {
    await _storage.delete(key: 'lexaid_token');
    _isAuthenticated = false;
    notifyListeners();
  }
}
