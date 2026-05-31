import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/document_model.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:8000'; // For Android emulator. Use real IP for physical device.
  final Dio _dio = Dio(BaseOptions(baseUrl: baseUrl, connectTimeout: const Duration(seconds: 120), receiveTimeout: const Duration(seconds: 120)));
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'lexaid_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  Future<String> login(String email, String password) async {
    final response = await _dio.post('/api/auth/login', data: {
      'email': email,
      'password': password,
    });
    return response.data['access_token'];
  }

  Future<String> register(String fullName, String email, String password) async {
    final response = await _dio.post('/api/auth/register', data: {
      'full_name': fullName,
      'email': email,
      'password': password,
    });
    return response.data['access_token'];
  }

  Future<AnalysisResponse> uploadDocument(File file) async {
    String fileName = file.path.split('/').last;
    FormData formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(file.path, filename: fileName),
    });

    final response = await _dio.post('/api/documents/upload', data: formData);
    return AnalysisResponse.fromJson(response.data);
  }

  Future<List<DocumentHistory>> getHistory() async {
    final response = await _dio.get('/api/documents/history');
    final List<dynamic> data = response.data;
    return data.map((json) => DocumentHistory.fromJson(json)).toList();
  }

  Future<AnalysisResponse> getDocument(String id) async {
    final response = await _dio.get('/api/documents/$id');
    return AnalysisResponse.fromJson(response.data);
  }

  Future<AnalysisResponse> translateDocument(String id, String language) async {
    final response = await _dio.post('/api/documents/$id/translate', data: {
      'target_language': language,
    });
    return AnalysisResponse.fromJson(response.data);
  }

  Future<String> chatDocument(String message, String documentText) async {
    final response = await _dio.post('/api/chat/document', data: {
      'message': message,
      'document_text': documentText,
    });
    return response.data['reply'];
  }

  Future<String> chatLegal(String message, List<Map<String, dynamic>> history) async {
    final response = await _dio.post('/api/chat/legal', data: {
      'message': message,
      'conversation_history': history,
    });
    return response.data['reply'];
  }

  // --- Generator ---
  Future<List<dynamic>> getDocTypes() async {
    final response = await _dio.get('/api/generator/types');
    return response.data;
  }

  Future<Map<String, dynamic>> generateDoc(String docType, Map<String, dynamic> formData) async {
    final response = await _dio.post('/api/generator/generate', data: {
      'doc_type': docType,
      'form_data': formData,
    });
    return response.data;
  }

  // --- Lawyers ---
  Future<List<dynamic>> getLawyers(String city, String specialization) async {
    final response = await _dio.get('/api/lawyers', queryParameters: {
      if (city.isNotEmpty) 'city': city,
      if (specialization != 'All') 'specialization': specialization,
    });
    return response.data;
  }

  // --- Forum ---
  Future<List<dynamic>> getForumPosts(String category) async {
    final response = await _dio.get('/api/forum/posts', queryParameters: {
      if (category != 'all') 'category': category,
    });
    return response.data;
  }

  Future<Map<String, dynamic>> getForumPost(String id) async {
    final response = await _dio.get('/api/forum/posts/$id');
    return response.data;
  }

  Future<void> createForumPost(String title, String content, String category) async {
    await _dio.post('/api/forum/posts', data: {
      'title': title,
      'content': content,
      'category': category,
    });
  }

  Future<void> replyForumPost(String id, String content) async {
    await _dio.post('/api/forum/posts/$id/reply', data: {
      'content': content,
    });
  }

  // --- News ---
  Future<List<dynamic>> getNews(String category) async {
    final response = await _dio.get('/api/news', queryParameters: {
      if (category != 'All') 'category': category,
    });
    return response.data;
  }
}
