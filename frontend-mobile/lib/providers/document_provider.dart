import 'package:flutter/material.dart';
import '../models/document_model.dart';

class DocumentProvider with ChangeNotifier {
  AnalysisResponse? _analysis;
  String _currentLanguage = 'english';

  AnalysisResponse? get analysis => _analysis;
  String get currentLanguage => _currentLanguage;

  void setAnalysis(AnalysisResponse? newAnalysis) {
    _analysis = newAnalysis;
    notifyListeners();
  }

  void setLanguage(String language) {
    _currentLanguage = language;
    notifyListeners();
  }
}
