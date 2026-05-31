import 'package:flutter/material.dart';
import '../api/api_service.dart';

class ForumScreen extends StatefulWidget {
  const ForumScreen({Key? key}) : super(key: key);

  @override
  State<ForumScreen> createState() => _ForumScreenState();
}

class _ForumScreenState extends State<ForumScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _posts = [];
  bool _isLoading = true;
  String _category = 'all';

  final List<Map<String, String>> _categories = [
    {'id': 'all', 'label': 'All'},
    {'id': 'rent', 'label': 'Rent'},
    {'id': 'employment', 'label': 'Employment'},
    {'id': 'consumer', 'label': 'Consumer'},
    {'id': 'family', 'label': 'Family'},
    {'id': 'criminal', 'label': 'Criminal'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchPosts();
  }

  Future<void> _fetchPosts() async {
    setState(() => _isLoading = true);
    try {
      final posts = await _apiService.getForumPosts(_category);
      setState(() {
        _posts = posts;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Community Forum')),
      body: Column(
        children: [
          Container(
            height: 50,
            color: Colors.white,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                  child: ChoiceChip(
                    label: Text(cat['label']!),
                    selected: _category == cat['id'],
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _category = cat['id']!);
                        _fetchPosts();
                      }
                    },
                  ),
                );
              },
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _posts.isEmpty
                    ? const Center(child: Text('No posts found'))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _posts.length,
                        itemBuilder: (context, index) {
                          final post = _posts[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(4)),
                                        child: Text(post['category'].toString().toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                                      ),
                                      const Spacer(),
                                      if (post['is_answered'])
                                        const Icon(Icons.check_circle, color: Colors.green, size: 16),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(post['title'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  const SizedBox(height: 8),
                                  Text(post['content'], maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.grey)),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      const Icon(Icons.thumb_up, size: 14, color: Colors.grey),
                                      const SizedBox(width: 4),
                                      Text('${post['upvotes']}'),
                                      const SizedBox(width: 16),
                                      const Icon(Icons.comment, size: 14, color: Colors.grey),
                                      const SizedBox(width: 4),
                                      Text('${post['reply_count']}'),
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
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Placeholder for adding a post
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Use the Web App to post')));
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
