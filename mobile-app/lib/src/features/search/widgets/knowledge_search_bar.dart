import 'package:flutter/material.dart';

import '../../../core/theme/ks_tokens.dart';
import '../models/search_models.dart';

class KnowledgeSearchBar extends StatelessWidget {
  const KnowledgeSearchBar({
    super.key,
    required this.controller,
    required this.mode,
    required this.onModeChanged,
    required this.onChanged,
    required this.hintText,
    this.onFilterTap,
  });

  final TextEditingController controller;
  final SearchWorldMode mode;
  final ValueChanged<SearchWorldMode> onModeChanged;
  final ValueChanged<String> onChanged;
  final String hintText;
  final VoidCallback? onFilterTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          controller: controller,
          onChanged: onChanged,
          decoration: InputDecoration(
            hintText: hintText,
            prefixIcon: const Icon(Icons.search_rounded),
            suffixIcon: IconButton(
              tooltip: 'Filter',
              onPressed: onFilterTap,
              icon: const Icon(Icons.tune_rounded),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            ChoiceChip(
              selected: mode == SearchWorldMode.open,
              label: const Text('Open World'),
              onSelected: (_) => onModeChanged(SearchWorldMode.open),
            ),
            const SizedBox(width: 8),
            ChoiceChip(
              selected: mode == SearchWorldMode.privateWorld,
              label: const Text('Private World'),
              onSelected: (_) => onModeChanged(SearchWorldMode.privateWorld),
            ),
            const Spacer(),
            Text(
              mode == SearchWorldMode.open ? 'Public' : 'Private',
              style: Theme.of(
                context,
              ).textTheme.labelMedium?.copyWith(color: KsColors.textMuted),
            ),
          ],
        ),
      ],
    );
  }
}
