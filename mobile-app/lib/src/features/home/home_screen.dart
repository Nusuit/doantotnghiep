import 'dart:async';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import '../../app/app_services.dart';
import '../../core/theme/ks_tokens.dart';
import '../../shared/widgets/glass_card.dart';
import '../search/models/search_models.dart';
import '../search/widgets/knowledge_search_bar.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  SearchWorldMode _mode = SearchWorldMode.open;
  SearchFilters _filters = const SearchFilters();
  List<SearchSuggestion> _suggestions = const [];
  bool _loading = false;
  Timer? _debounce;
  Position? _position;

  @override
  void initState() {
    super.initState();
    _bootstrapLocation();
    _search();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _bootstrapLocation() async {
    try {
      final perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        await Geolocator.requestPermission();
      }
      if (await Geolocator.isLocationServiceEnabled()) {
        _position = await Geolocator.getCurrentPosition();
      }
    } catch (_) {
      // keep search available without location
    }
  }

  void _onQueryChanged(String _) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 240), _search);
  }

  Future<void> _search() async {
    setState(() => _loading = true);
    final services = AppServicesScope.read(context);
    try {
      final result = await services.searchService.suggest(
        query: _searchCtrl.text,
        mode: _mode,
        filters: _filters,
        currentLat: _position?.latitude,
        currentLng: _position?.longitude,
      );
      if (!mounted) return;
      setState(() => _suggestions = result);
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  void _openInExplore(SearchSuggestion item) {
    final services = AppServicesScope.read(context);
    services.searchFlow.openExplore(
      query: _searchCtrl.text,
      mode: _mode,
      selectedResult: item,
    );
  }

  Future<void> _openFilterSheet() async {
    final selected = await showModalBottomSheet<SearchFilters>(
      context: context,
      builder: (context) => _SearchFilterSheet(initial: _filters),
    );
    if (selected != null) {
      setState(() => _filters = selected);
      await _search();
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 20, 18, 8),
      children: [
        GlassCard(
          child: KnowledgeSearchBar(
            controller: _searchCtrl,
            mode: _mode,
            onModeChanged: (mode) {
              setState(() => _mode = mode);
              _search();
            },
            onChanged: _onQueryChanged,
            onFilterTap: _openFilterSheet,
            hintText: 'Search concepts, experts, reviews, places...',
          ),
        ),
        const SizedBox(height: 12),
        if (_loading)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Center(child: CircularProgressIndicator()),
          )
        else
          ..._suggestions.map((item) {
            final icon = item.type == SearchResultType.place
                ? Icons.location_on_outlined
                : Icons.article_outlined;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: GlassCard(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),
                child: InkWell(
                  borderRadius: BorderRadius.circular(20),
                  onTap: () => _openInExplore(item),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Row(
                      children: [
                        Icon(icon, color: KsColors.brandBlue),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.title,
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                item.subtitle,
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ),
                        const Icon(
                          Icons.arrow_forward_ios_rounded,
                          size: 16,
                          color: KsColors.textMuted,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }),
        if (!_loading &&
            _suggestions.isEmpty &&
            _searchCtrl.text.trim().isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 18),
            child: Text(
              'Không có kết quả phù hợp cho "${_searchCtrl.text.trim()}".',
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(color: KsColors.textMuted),
            ),
          ),
      ],
    );
  }
}

class _SearchFilterSheet extends StatefulWidget {
  const _SearchFilterSheet({required this.initial});

  final SearchFilters initial;

  @override
  State<_SearchFilterSheet> createState() => _SearchFilterSheetState();
}

class _SearchFilterSheetState extends State<_SearchFilterSheet> {
  late double _minRating;
  late bool _nearbyOnly;
  late bool _recentOnly;

  @override
  void initState() {
    super.initState();
    _minRating = widget.initial.minRating ?? 0;
    _nearbyOnly = widget.initial.nearbyOnly;
    _recentOnly = widget.initial.createdAfter != null;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Search Filters', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Row(
            children: [
              const Text('Min rating'),
              const SizedBox(width: 10),
              Expanded(
                child: Slider(
                  value: _minRating,
                  min: 0,
                  max: 5,
                  divisions: 10,
                  label: _minRating.toStringAsFixed(1),
                  onChanged: (value) => setState(() => _minRating = value),
                ),
              ),
            ],
          ),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            value: _nearbyOnly,
            onChanged: (v) => setState(() => _nearbyOnly = v),
            title: const Text('Nearby only'),
          ),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            value: _recentOnly,
            onChanged: (v) => setState(() => _recentOnly = v),
            title: const Text('Recent (last 30 days)'),
          ),
          const SizedBox(height: 8),
          FilledButton(
            onPressed: () {
              Navigator.pop(
                context,
                SearchFilters(
                  minRating: _minRating > 0 ? _minRating : null,
                  nearbyOnly: _nearbyOnly,
                  createdAfter: _recentOnly
                      ? DateTime.now().subtract(const Duration(days: 30))
                      : null,
                ),
              );
            },
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }
}
