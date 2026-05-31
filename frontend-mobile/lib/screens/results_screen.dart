import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/document_provider.dart';
import '../widgets/clause_card.dart';
import '../widgets/language_toggle.dart';

class ResultsScreen extends StatelessWidget {
  const ResultsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final analysis = Provider.of<DocumentProvider>(context).analysis;

    if (analysis == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Results')),
        body: const Center(child: Text('No analysis found')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Analysis Results'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Language Toggle
            const Align(
              alignment: Alignment.centerRight,
              child: LanguageToggleWidget(),
            ),
            const SizedBox(height: 16),

            // Risk Summary Banner
            _buildRiskBanner(analysis.overallRisk, analysis.riskSummary),
            const SizedBox(height: 16),

            // Stat Cards
            Row(
              children: [
                Expanded(child: _buildStatCard('🔴', analysis.highRiskCount, 'High Risk', Colors.red)),
                const SizedBox(width: 8),
                Expanded(child: _buildStatCard('🟡', analysis.mediumRiskCount, 'Med Risk', Colors.orange)),
                const SizedBox(width: 8),
                Expanded(child: _buildStatCard('🟢', analysis.lowRiskCount, 'Low Risk', Colors.green)),
              ],
            ),
            const SizedBox(height: 24),

            const Text(
              'Clause-by-Clause Breakdown',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1A1F3A)),
            ),
            const SizedBox(height: 16),

            // Clauses List
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: analysis.clauses.length,
              itemBuilder: (context, index) {
                return ClauseCardWidget(clause: analysis.clauses[index]);
              },
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, '/chat'),
        backgroundColor: const Color(0xFF1A1F3A),
        child: const Icon(Icons.chat_bubble_outline),
      ),
    );
  }

  Widget _buildRiskBanner(String overallRisk, String summary) {
    Color bgColor;
    Color borderColor;
    Color textColor;
    String icon;

    switch (overallRisk.toUpperCase()) {
      case 'HIGH':
        bgColor = const Color(0xFFFEF2F2);
        borderColor = const Color(0xFFEF4444);
        textColor = const Color(0xFFEF4444);
        icon = '🔴';
        break;
      case 'MEDIUM':
        bgColor = const Color(0xFFFFFBEB);
        borderColor = const Color(0xFFF59E0B);
        textColor = const Color(0xFFF59E0B);
        icon = '🟡';
        break;
      default:
        bgColor = const Color(0xFFF0FDF4);
        borderColor = const Color(0xFF22C55E);
        textColor = const Color(0xFF22C55E);
        icon = '🟢';
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        border: Border.all(color: borderColor),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(icon, style: const TextStyle(fontSize: 24)),
              const SizedBox(width: 8),
              Text(
                'Overall Risk: $overallRisk',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            summary,
            style: const TextStyle(fontSize: 14, color: Colors.black87),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String icon, int count, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        children: [
          Text(icon, style: const TextStyle(fontSize: 20)),
          const SizedBox(height: 4),
          Text(
            count.toString(),
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.grey),
          ),
        ],
      ),
    );
  }
}
