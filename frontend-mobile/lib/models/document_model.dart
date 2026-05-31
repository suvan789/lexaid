import 'clause_model.dart';

class AnalysisResponse {
  final String documentType;
  final String overallRisk;
  final String riskSummary;
  final int totalClauses;
  final int highRiskCount;
  final int mediumRiskCount;
  final int lowRiskCount;
  final List<ClauseModel> clauses;
  final String documentText;
  final String? documentId;

  AnalysisResponse({
    required this.documentType,
    required this.overallRisk,
    required this.riskSummary,
    required this.totalClauses,
    required this.highRiskCount,
    required this.mediumRiskCount,
    required this.lowRiskCount,
    required this.clauses,
    required this.documentText,
    this.documentId,
  });

  factory AnalysisResponse.fromJson(Map<String, dynamic> json) {
    var clausesList = json['clauses'] as List? ?? [];
    List<ClauseModel> parsedClauses =
        clausesList.map((c) => ClauseModel.fromJson(c)).toList();

    return AnalysisResponse(
      documentType: json['document_type'] ?? 'Unknown',
      overallRisk: json['overall_risk'] ?? 'MEDIUM',
      riskSummary: json['risk_summary'] ?? '',
      totalClauses: json['total_clauses'] ?? 0,
      highRiskCount: json['high_risk_count'] ?? 0,
      mediumRiskCount: json['medium_risk_count'] ?? 0,
      lowRiskCount: json['low_risk_count'] ?? 0,
      clauses: parsedClauses,
      documentText: json['document_text'] ?? '',
      documentId: json['document_id'],
    );
  }
}

class DocumentHistory {
  final String id;
  final String filename;
  final String documentType;
  final String overallRisk;
  final String riskSummary;
  final DateTime createdAt;

  DocumentHistory({
    required this.id,
    required this.filename,
    required this.documentType,
    required this.overallRisk,
    required this.riskSummary,
    required this.createdAt,
  });

  factory DocumentHistory.fromJson(Map<String, dynamic> json) {
    return DocumentHistory(
      id: json['id'] ?? '',
      filename: json['filename'] ?? '',
      documentType: json['document_type'] ?? '',
      overallRisk: json['overall_risk'] ?? 'MEDIUM',
      riskSummary: json['risk_summary'] ?? '',
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }
}
