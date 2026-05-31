import 'package:flutter/material.dart';
import '../api/api_service.dart';

class GeneratorScreen extends StatefulWidget {
  const GeneratorScreen({Key? key}) : super(key: key);

  @override
  State<GeneratorScreen> createState() => _GeneratorScreenState();
}

class _GeneratorScreenState extends State<GeneratorScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _docTypes = [];
  bool _isLoading = true;
  Map<String, dynamic>? _selectedType;
  Map<String, String> _formData = {};
  bool _isGenerating = false;
  String? _generatedContent;

  @override
  void initState() {
    super.initState();
    _fetchDocTypes();
  }

  Future<void> _fetchDocTypes() async {
    try {
      final types = await _apiService.getDocTypes();
      setState(() {
        _docTypes = types;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _generateDoc() async {
    if (_selectedType == null) return;
    setState(() => _isGenerating = true);
    try {
      final result = await _apiService.generateDoc(_selectedType!['type'], _formData);
      setState(() {
        _generatedContent = result['content'];
        _isGenerating = false;
      });
    } catch (e) {
      setState(() => _isGenerating = false);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to generate document')));
    }
  }

  Widget _buildForm() {
    if (_selectedType == null) return const SizedBox();
    List<dynamic> fields = _selectedType!['required_fields'];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Fill Details for ${_selectedType!['name']}',
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        ...fields.map((field) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: TextFormField(
              decoration: InputDecoration(
                labelText: field.toString().replaceAll('_', ' ').toUpperCase(),
                border: const OutlineInputBorder(),
              ),
              onChanged: (value) => _formData[field] = value,
            ),
          );
        }).toList(),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: _isGenerating ? null : _generateDoc,
          child: _isGenerating ? const CircularProgressIndicator(color: Colors.white) : const Text('Generate Document'),
        ),
        TextButton(
          onPressed: () => setState(() => _selectedType = null),
          child: const Text('Back to Templates'),
        )
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Document Generator')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _generatedContent != null
              ? SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                        child: Text(_generatedContent!, style: const TextStyle(fontFamily: 'monospace')),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => setState(() {
                          _generatedContent = null;
                          _selectedType = null;
                          _formData.clear();
                        }),
                        child: const Text('Generate Another'),
                      )
                    ],
                  ),
                )
              : _selectedType != null
                  ? _buildForm()
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _docTypes.length,
                      itemBuilder: (context, index) {
                        final type = _docTypes[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            leading: const Icon(Icons.description, color: Colors.blue),
                            title: Text(type['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text(type['description']),
                            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                            onTap: () {
                              setState(() {
                                _selectedType = type;
                                _formData.clear();
                              });
                            },
                          ),
                        );
                      },
                    ),
    );
  }
}
