import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../api/api_service.dart';
import '../models/document_model.dart';
import '../providers/document_provider.dart';
import '../widgets/risk_badge.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({Key? key}) : super(key: key);

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final ApiService _apiService = ApiService();
  late Future<List<DocumentHistory>> _historyFuture;

  @override
  void initState() {
    super.initState();
    _historyFuture = _apiService.getHistory();
  }

  Future<void> _viewDocument(String id) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final analysis = await _apiService.getDocument(id);
      if (mounted) {
        Navigator.pop(context); // Close loading dialog
        Provider.of<DocumentProvider>(context, listen: false).setAnalysis(analysis);
        Provider.of<DocumentProvider>(context, listen: false).setLanguage('english');
        Navigator.pushNamed(context, '/results');
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Close loading dialog
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load document: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Documents')),
      body: FutureBuilder<List<DocumentHistory>>(
        future: _historyFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No documents found. Upload one!'));
          }

          final docs = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(16.0),
            itemCount: docs.length,
            itemBuilder: (context, index) {
              final doc = docs[index];
              final dateStr = DateFormat('dd MMM yyyy').format(doc.createdAt);
              
              Color borderColor;
              switch (doc.overallRisk.toUpperCase()) {
                case 'HIGH': borderColor = const Color(0xFFEF4444); break;
                case 'MEDIUM': borderColor = const Color(0xFFF59E0B); break;
                case 'LOW': borderColor = const Color(0xFF22C55E); break;
                default: borderColor = Colors.grey;
              }

              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                elevation: 1,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.grey.shade200),
                ),
                child: Container(
                  decoration: BoxDecoration(
                    border: Border(left: BorderSide(color: borderColor, width: 4)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                doc.filename,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            RiskBadge(riskLevel: doc.overallRisk),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${doc.documentType} • $dateStr',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          doc.riskSummary,
                          style: const TextStyle(fontSize: 14),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 12),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () => _viewDocument(doc.id),
                            child: const Text('View Analysis →', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4F6EF7))),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
