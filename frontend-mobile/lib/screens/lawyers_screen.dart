import 'package:flutter/material.dart';
import '../api/api_service.dart';

class LawyersScreen extends StatefulWidget {
  const LawyersScreen({Key? key}) : super(key: key);

  @override
  State<LawyersScreen> createState() => _LawyersScreenState();
}

class _LawyersScreenState extends State<LawyersScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _lawyers = [];
  bool _isLoading = true;
  String _city = '';
  String _specialization = 'All';

  final List<String> _specs = [
    'All', 'Criminal', 'Civil', 'Family', 'Property', 'Labour',
    'Consumer', 'Corporate', 'Tax', 'Immigration'
  ];

  @override
  void initState() {
    super.initState();
    _fetchLawyers();
  }

  Future<void> _fetchLawyers() async {
    setState(() => _isLoading = true);
    try {
      final lawyers = await _apiService.getLawyers(_city, _specialization);
      setState(() {
        _lawyers = lawyers;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Find a Lawyer')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              children: [
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'City',
                    border: OutlineInputBorder(),
                    isDense: true,
                  ),
                  onChanged: (val) => _city = val,
                  onSubmitted: (_) => _fetchLawyers(),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _specialization,
                  decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true),
                  items: _specs.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      setState(() => _specialization = val);
                      _fetchLawyers();
                    }
                  },
                ),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _lawyers.isEmpty
                    ? const Center(child: Text('No lawyers found'))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _lawyers.length,
                        itemBuilder: (context, index) {
                          final lawyer = _lawyers[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 16),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      CircleAvatar(
                                        backgroundColor: const Color(0xFF1A1F3A),
                                        child: Text(lawyer['name'][0], style: const TextStyle(color: Colors.white)),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(lawyer['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                            Text('${lawyer['city']}, ${lawyer['state']}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                          ],
                                        ),
                                      ),
                                      if (lawyer['verified'])
                                        const Icon(Icons.verified, color: Colors.blue, size: 20),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Wrap(
                                    spacing: 8,
                                    children: (lawyer['specialization'] as List).map<Widget>((s) {
                                      return Chip(
                                        label: Text(s, style: const TextStyle(fontSize: 10)),
                                        padding: EdgeInsets.zero,
                                      );
                                    }).toList(),
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text('Exp: ${lawyer['experience_years']} yrs'),
                                      Text('₹${lawyer['fee_min']} - ₹${lawyer['fee_max']}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                                    ],
                                  )
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
