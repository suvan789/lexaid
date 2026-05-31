import 'package:flutter/material.dart';
import '../models/clause_model.dart';
import 'risk_badge.dart';

class ClauseCardWidget extends StatelessWidget {
  final ClauseModel clause;

  const ClauseCardWidget({Key? key, required this.clause}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color borderColor;
    switch (clause.riskLevel.toUpperCase()) {
      case 'HIGH':
        borderColor = const Color(0xFFEF4444);
        break;
      case 'MEDIUM':
        borderColor = const Color(0xFFF59E0B);
        break;
      case 'LOW':
        borderColor = const Color(0xFF22C55E);
        break;
      default:
        borderColor = Colors.grey;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
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
              // Header Row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      '${clause.clauseNumber}. ${clause.heading}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1A1F3A)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  RiskBadge(riskLevel: clause.riskLevel),
                ],
              ),
              const SizedBox(height: 16),

              // Plain English
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'IN PLAIN ENGLISH',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1),
                    ),
                    const SizedBox(height: 4),
                    Text(clause.plainExplanation, style: const TextStyle(fontSize: 14)),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // What this means
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('👤', style: TextStyle(fontSize: 20)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'WHAT THIS MEANS FOR YOU',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1),
                        ),
                        const SizedBox(height: 4),
                        Text(clause.whatItMeansForYou, style: const TextStyle(fontSize: 14)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Your Rights (if any)
              if (clause.yourRights.isNotEmpty)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    border: const Border(left: BorderSide(color: Color(0xFF4F6EF7), width: 3)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('⚖️', style: TextStyle(fontSize: 20)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'YOUR LEGAL RIGHTS',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF4F6EF7), letterSpacing: 1),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              clause.yourRights,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF1A1F3A)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

              // Original Text Expansion
              ExpansionTile(
                title: const Text(
                  'View Original Clause Text',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey),
                ),
                tilePadding: EdgeInsets.zero,
                childrenPadding: const EdgeInsets.only(bottom: 8),
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade900,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      clause.originalText,
                      style: const TextStyle(fontFamily: 'monospace', fontSize: 12, color: Colors.white70),
                    ),
                  )
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
