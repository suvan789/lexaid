import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import '../api/api_service.dart';
import '../providers/document_provider.dart';

class AnalyzeScreen extends StatefulWidget {
  const AnalyzeScreen({Key? key}) : super(key: key);

  @override
  State<AnalyzeScreen> createState() => _AnalyzeScreenState();
}

class _AnalyzeScreenState extends State<AnalyzeScreen> {
  File? _selectedFile;
  bool _isLoading = false;
  final ApiService _apiService = ApiService();
  final List<String> _loadingMessages = [
    "Reading your document...",
    "Extracting clauses...",
    "Assessing risk levels...",
    "Checking your legal rights...",
    "Almost done...",
  ];
  int _messageIndex = 0;

  Future<void> _pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );

    if (result != null && result.files.single.path != null) {
      setState(() {
        _selectedFile = File(result.files.single.path!);
      });
    }
  }

  void _cycleMessages() async {
    while (_isLoading) {
      await Future.delayed(const Duration(seconds: 2));
      if (mounted && _isLoading) {
        setState(() {
          _messageIndex = (_messageIndex + 1) % _loadingMessages.length;
        });
      }
    }
  }

  Future<void> _uploadAndAnalyze() async {
    if (_selectedFile == null) return;

    setState(() {
      _isLoading = true;
      _messageIndex = 0;
    });
    _cycleMessages();

    try {
      final analysis = await _apiService.uploadDocument(_selectedFile!);
      if (mounted) {
        Provider.of<DocumentProvider>(context, listen: false).setAnalysis(analysis);
        Provider.of<DocumentProvider>(context, listen: false).setLanguage('english');
        Navigator.pushReplacementNamed(context, '/results');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Upload failed: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Analyze Document'),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Understand Any Legal Document',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1A1F3A)),
              ),
              const SizedBox(height: 12),
              const Text(
                'Upload your contract, rent agreement, or legal notice. LexAid explains every clause in plain English.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 32),
              
              // Upload Area
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                padding: const EdgeInsets.all(32),
                child: Column(
                  children: [
                    Icon(
                      _selectedFile != null ? Icons.check_circle : Icons.upload_file,
                      size: 64,
                      color: _selectedFile != null ? Colors.green : Colors.grey,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _selectedFile != null ? _selectedFile!.path.split('/').last : 'No PDF selected',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _pickFile,
                      icon: const Icon(Icons.folder),
                      label: const Text('Select PDF Document'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF1A1F3A),
                        side: const BorderSide(color: Color(0xFF1A1F3A)),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              if (_isLoading) ...[
                const LinearProgressIndicator(),
                const SizedBox(height: 16),
                Text(
                  _loadingMessages[_messageIndex],
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontStyle: FontStyle.italic, color: Colors.grey),
                ),
              ] else if (_selectedFile != null) ...[
                ElevatedButton(
                  onPressed: _uploadAndAnalyze,
                  child: const Text('Analyze Document'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
