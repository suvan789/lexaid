import 'package:flutter/material.dart';
import '../api/api_service.dart';
import '../widgets/chat_bubble.dart';

class ChatLegalScreen extends StatefulWidget {
  const ChatLegalScreen({Key? key}) : super(key: key);

  @override
  State<ChatLegalScreen> createState() => _ChatLegalScreenState();
}

class _ChatLegalScreenState extends State<ChatLegalScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ApiService _apiService = ApiService();
  bool _isTyping = false;
  
  final List<Map<String, dynamic>> _messages = [
    {
      'role': 'assistant',
      'text': "Namaste! 🙏 I'm LexAid, your AI legal assistant. Ask me anything about Indian law."
    }
  ];

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _isTyping) return;

    setState(() {
      _messages.add({'role': 'user', 'text': text});
      _isTyping = true;
    });
    _controller.clear();
    _scrollToBottom();

    try {
      final history = _messages.map((m) => {'role': m['role'], 'content': m['text']}).toList();
      final reply = await _apiService.chatLegal(text, history.length > 10 ? history.sublist(history.length - 10) : history);
      setState(() {
        _messages.add({'role': 'assistant', 'text': reply + '\n\n⚖️ Consult a lawyer for specific advice.'});
      });
    } catch (e) {
      setState(() {
        _messages.add({'role': 'assistant', 'text': 'Sorry, I encountered an error. Please try again.'});
      });
    } finally {
      setState(() {
        _isTyping = false;
      });
      _scrollToBottom();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Legal Chat'),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(8.0),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length && _isTyping) {
                  return const Align(
                    alignment: Alignment.centerLeft,
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                          SizedBox(width: 12),
                          Text('Typing...', style: TextStyle(color: Colors.grey)),
                        ],
                      ),
                    ),
                  );
                }
                
                final msg = _messages[index];
                final isUser = msg['role'] == 'user';
                return Row(
                  mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (!isUser) ...[
                      const CircleAvatar(
                        radius: 12,
                        backgroundColor: Colors.white,
                        child: Text('⚖️', style: TextStyle(fontSize: 12)),
                      ),
                      const SizedBox(width: 4),
                    ],
                    Flexible(
                      child: ChatBubble(
                        text: msg['text'],
                        isUser: isUser,
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
          
          Container(
            padding: const EdgeInsets.all(8.0),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, -1)),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(
                      hintText: 'Ask about Indian law...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: Colors.grey.shade100,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: _isTyping ? Colors.grey : const Color(0xFF4F6EF7),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white, size: 20),
                    onPressed: _isTyping ? null : _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
