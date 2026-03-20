import 'package:flutter/material.dart';

import '../../app/app_services.dart';
import '../../core/theme/ks_tokens.dart';
import '../../shared/widgets/glass_card.dart';
import '../search/models/search_models.dart';
import 'data/feed_models.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  AppServices? _services;
  bool _loading = true;
  String? _error;
  List<FeedItem> _items = const [];
  List<SearchSuggestion> _searchResults = const [];
  String _query = '';
  SearchWorldMode _mode = SearchWorldMode.open;
  String? _selectedResultId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadCurrent());
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final services = AppServicesScope.of(context);
    if (_services == services) return;
    _services?.searchFlow.removeListener(_handleFlowChanged);
    _services = services;
    _services!.searchFlow.addListener(_handleFlowChanged);
  }

  @override
  void dispose() {
    _services?.searchFlow.removeListener(_handleFlowChanged);
    super.dispose();
  }

  void _handleFlowChanged() {
    if (!mounted) return;
    _loadCurrent();
  }

  Future<void> _loadCurrent() async {
    final services = _services ?? AppServicesScope.read(context);
    final query = services.searchFlow.exploreQuery;
    final mode = services.searchFlow.exploreMode;
    final selectedResultId = services.searchFlow.selectedExploreResult?.id;
    if (_query == query &&
        _mode == mode &&
        _selectedResultId == selectedResultId &&
        ((_query.isEmpty && (_items.isNotEmpty || _error != null)) ||
            (_query.isNotEmpty && (_searchResults.isNotEmpty || _error != null)))) {
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
      _query = query;
      _mode = mode;
      _selectedResultId = selectedResultId;
    });

    try {
      if (query.isEmpty) {
        final page = await services.feedRepository.fetchFeed(limit: 30);
        if (!mounted) return;
        setState(() {
          _items = page.items;
          _searchResults = const [];
        });
      } else {
        final results = await services.searchService.search(
          query: query,
          mode: mode,
          filters: const SearchFilters(),
        );
        if (!mounted) return;
        results.sort((a, b) {
          final aSelected = a.id == selectedResultId ? 1 : 0;
          final bSelected = b.id == selectedResultId ? 1 : 0;
          if (aSelected != bSelected) {
            return bSelected.compareTo(aSelected);
          }
          return b.score.compareTo(a.score);
        });
        setState(() {
          _searchResults = results;
          _items = const [];
        });
      }
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = 'Cannot load data: $error');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _lookInMap(SearchSuggestion item) {
    final services = _services ?? AppServicesScope.read(context);
    services.searchFlow.openMap(item);
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 20, 18, 8),
      children: [
        if (_query.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'Kết quả cho "$_query"',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    final services = _services ?? AppServicesScope.read(context);
                    services.searchFlow.clearExploreQuery();
                  },
                  child: const Text('Clear'),
                ),
              ],
            ),
          ),
        if (_loading)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Center(child: CircularProgressIndicator()),
          )
        else if (_error != null)
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_error!, style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 10),
                FilledButton(onPressed: _loadCurrent, child: const Text('Retry')),
              ],
            ),
          )
        else if (_query.isNotEmpty)
          ..._buildSearchResultCards(context)
        else if (_items.isEmpty)
          const GlassCard(
            child: Text(
              'No feed items yet. Start by creating knowledge posts.',
            ),
          )
        else
          ..._buildFeedCards(context),
      ],
    );
  }

  List<Widget> _buildSearchResultCards(BuildContext context) {
    if (_searchResults.isEmpty) {
      return [
        GlassCard(
          child: Text(
            'Chưa có kết quả khớp cho "$_query".',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
      ];
    }

    return _searchResults.map((item) {
      final selected = item.id == _selectedResultId;
      final icon = item.type == SearchResultType.place
          ? Icons.location_on_outlined
          : Icons.article_outlined;
      final typeLabel = item.type == SearchResultType.place ? 'Place' : 'Post';
      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: GlassCard(
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              border: selected
                  ? Border.all(
                      color: KsColors.brandBlue.withValues(alpha: 0.4),
                      width: 1.4,
                    )
                  : null,
            ),
            padding: const EdgeInsets.all(2),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: KsColors.brandBlue.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Icon(icon, color: KsColors.brandBlue),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        item.title,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                    Chip(label: Text(typeLabel)),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  item.subtitle,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                if ((item.snippet ?? '').trim().isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    item.snippet!,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
                if ((item.locationName ?? '').trim().isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const Icon(
                        Icons.place_outlined,
                        size: 16,
                        color: KsColors.textMuted,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          item.locationName!,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ),
                    ],
                  ),
                ],
                if (item.canLookInMap) ...[
                  const SizedBox(height: 12),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: OutlinedButton.icon(
                      onPressed: () => _lookInMap(item),
                      icon: const Icon(Icons.map_outlined),
                      label: const Text('Look in Map'),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      );
    }).toList();
  }

  List<Widget> _buildFeedCards(BuildContext context) {
    return _items.map((item) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: KsColors.brandBlue.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(
                      Icons.person,
                      color: KsColors.brandBlue,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      item.authorName,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                  if (item.field != null) Chip(label: Text(item.field!)),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                item.title,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                item.excerpt,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.favorite_border, size: 16),
                  const SizedBox(width: 4),
                  Text('${item.likes}'),
                  const SizedBox(width: 10),
                  const Icon(Icons.mode_comment_outlined, size: 16),
                  const SizedBox(width: 4),
                  Text('${item.comments}'),
                  const SizedBox(width: 10),
                  const Icon(Icons.share_outlined, size: 16),
                  const SizedBox(width: 4),
                  Text('${item.shares}'),
                ],
              ),
            ],
          ),
        ),
      );
    }).toList();
  }
}
