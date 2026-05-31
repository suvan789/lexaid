class ClauseModel {
  final int clauseNumber;
  final String heading;
  final String originalText;
  final String riskLevel;
  final String plainExplanation;
  final String whatItMeansForYou;
  final String yourRights;

  ClauseModel({
    required this.clauseNumber,
    required this.heading,
    required this.originalText,
    required this.riskLevel,
    required this.plainExplanation,
    required this.whatItMeansForYou,
    required this.yourRights,
  });

  factory ClauseModel.fromJson(Map<String, dynamic> json) {
    return ClauseModel(
      clauseNumber: json['clause_number'] ?? 0,
      heading: json['heading'] ?? '',
      originalText: json['original_text'] ?? '',
      riskLevel: json['risk_level'] ?? 'LOW',
      plainExplanation: json['plain_explanation'] ?? '',
      whatItMeansForYou: json['what_it_means_for_you'] ?? '',
      yourRights: json['your_rights'] ?? '',
    );
  }
}
