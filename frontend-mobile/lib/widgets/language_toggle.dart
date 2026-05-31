import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_service.dart';
import '../providers/document_provider.dart';

class LanguageToggleWidget extends StatefulWidget {
  const LanguageToggleWidget({Key? key}) : super(key: key);

  @override
  State<LanguageToggleWidget> createState() => _LanguageToggleWidgetState();
}

class _LanguageToggleWidgetState extends State<LanguageToggleWidget> {
  final ApiService _apiService = ApiService();
  bool _isLoading = false;

  Future<void> _changeLanguage(String langCode) async {
    final docProvider = Provider.of<DocumentProvider>(context, listen: false);
    if (docProvider.currentLanguage == langCode || docProvider.analysis?.documentId == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      if (langCode == 'english') {
        final analysis = await _apiService.getDocument(docProvider.analysis!.documentId!);
        docProvider.setAnalysis(analysis);
      } else {
        final translated = await _apiService.translateDocument(docProvider.analysis!.documentId!, langCode);
        docProvider.setAnalysis(translated);
      }
      docProvider.setLanguage(langCode);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Translation failed. Please try again.')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentLang = Provider.of<DocumentProvider>(context).currentLanguage;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildButton('English', 'english', currentLang),
          _buildButton('தமிழ்', 'tamil', currentLang),
          _buildButton('हिंदी', 'hindi', currentLang),
        ],
      ),
    );
  }

  Widget _buildButton(String label, String code, String currentLang) {
    final isActive = code == currentLang;
    return InkWell(
      onTap: _isLoading ? null : () => _changeLanguage(code),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF1A1F3A) : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
        ),
        child: _isLoading && isActive
            ? const SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : Text(
                label,
                style: TextStyle(
                  color: isActive ? Colors.white : Colors.grey.shade700,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                  fontSize: 12,
                ),
              ),
      ),
    );
  }
}
