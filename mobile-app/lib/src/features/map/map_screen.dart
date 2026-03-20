import 'dart:async';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart' as geo;
import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/app_services.dart';
import '../../core/config/mapbox_config.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/ks_tokens.dart';
import '../../shared/widgets/glass_card.dart';
import '../search/models/search_models.dart';
import '../search/widgets/knowledge_search_bar.dart';
import 'data/map_models.dart';
import 'providers/map_provider.dart';

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  final _searchCtrl = TextEditingController();
  SearchWorldMode _mode = SearchWorldMode.open;
  SearchFilters _filters = const SearchFilters();
  List<SearchSuggestion> _suggestions = const [];
  bool _searchLoading = false;
  Timer? _searchDebounce;
  AppServices? _services;
  int _lastMapFocusVersion = 0;

  MapboxMap? _mapboxMap;
  CircleAnnotationManager? _circleManager;
  geo.Position? _position;
  StreamSubscription<geo.Position>? _positionSub;

  MapContextItem? _selectedContext;
  bool _importingWorld = false;
  String? _locationError;

  int? _stayContextId;
  DateTime? _stayStartedAt;
  final Set<int> _stayPromptedContextIds = <int>{};

  @override
  void initState() {
    super.initState();
    _startLocationTracking();
    _search();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final services = AppServicesScope.of(context);
    if (_services == services) return;
    _services?.searchFlow.removeListener(_handleSearchFlowChanged);
    _services = services;
    _services!.searchFlow.addListener(_handleSearchFlowChanged);
  }

  @override
  void dispose() {
    _services?.searchFlow.removeListener(_handleSearchFlowChanged);
    _searchDebounce?.cancel();
    _positionSub?.cancel();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _handleSearchFlowChanged() {
    final services = _services;
    if (services == null || !mounted) return;
    final version = services.searchFlow.mapFocusVersion;
    if (version == _lastMapFocusVersion) return;
    _lastMapFocusVersion = version;
    final result = services.searchFlow.mapFocusResult;
    if (result == null) return;
    _focusFromSearchResult(result);
  }

  Future<void> _startLocationTracking() async {
    try {
      final enabled = await geo.Geolocator.isLocationServiceEnabled();
      if (!enabled) {
        setState(() => _locationError = 'Location service is disabled');
        return;
      }

      var permission = await geo.Geolocator.checkPermission();
      if (permission == geo.LocationPermission.denied) {
        permission = await geo.Geolocator.requestPermission();
      }
      if (permission == geo.LocationPermission.deniedForever ||
          permission == geo.LocationPermission.denied) {
        setState(() => _locationError = 'Location permission denied');
        return;
      }

      final current = await geo.Geolocator.getCurrentPosition();
      if (!mounted) return;
      setState(() {
        _position = current;
        _locationError = null;
      });
      _focusOnCoordinates(current.latitude, current.longitude, zoom: 15.2);

      _positionSub =
          geo.Geolocator.getPositionStream(
            locationSettings: const geo.LocationSettings(
              accuracy: geo.LocationAccuracy.bestForNavigation,
              distanceFilter: 15,
            ),
          ).listen((position) {
            if (!mounted) return;
            setState(() => _position = position);
            _refreshContexts();
            _search();
            _evaluateStayPrompt(position);
          });
    } catch (error) {
      if (!mounted) return;
      setState(() => _locationError = 'Cannot access location: $error');
    }
  }

  void _onMapCreated(MapboxMap mapboxMap) async {
    _mapboxMap = mapboxMap;
    _circleManager = await _mapboxMap!.annotations
        .createCircleAnnotationManager();
    final p = _position;
    if (p != null) {
      await _focusOnCoordinates(p.latitude, p.longitude, zoom: 15.2);
    }
  }

  Future<void> _focusOnCoordinates(
    double lat,
    double lng, {
    double zoom = 14.5,
  }) async {
    final map = _mapboxMap;
    if (map == null) return;
    await map.flyTo(
      CameraOptions(
        center: Point(coordinates: Position(lng, lat)),
        zoom: zoom,
      ),
      MapAnimationOptions(duration: 900),
    );
  }

  Future<void> _focusOnUser() async {
    final p = _position;
    if (p == null) return;
    await _focusOnCoordinates(p.latitude, p.longitude, zoom: 15.6);
  }

  Future<void> _refreshContexts({bool force = false}) async {
    if (_position == null) return;
    
    // Utilize Riverpod provider for fetching and caching
    await ref.read(mapContextsProvider.notifier).fetchContextsIfNeeded(_position!);
  }

  Future<void> _renderContextAnnotations(List<MapContextItem> contexts) async {
    final manager = _circleManager;
    if (manager == null) return;

    await manager.deleteAll();
    final points = contexts.where((item) => item.hasCoordinates).take(350).map(
      (item) {
        final color = _mode == SearchWorldMode.open
            ? KsColors.brandBlue.toARGB32()
            : KsColors.brandViolet.toARGB32();
        return CircleAnnotationOptions(
          geometry: Point(
            coordinates: Position(item.longitude!, item.latitude!),
          ),
          circleColor: color,
          circleRadius: 5.5,
          circleStrokeColor: Colors.white.toARGB32(),
          circleStrokeWidth: 1.5,
        );
      },
    ).toList();

    if (points.isNotEmpty) {
      await manager.createMulti(points);
    }
  }



  void _onSearchChanged(String _) {
    _searchDebounce?.cancel();
    _searchDebounce = Timer(const Duration(milliseconds: 220), _search);
  }

  Future<void> _search() async {
    setState(() => _searchLoading = true);
    final services = AppServicesScope.read(context);
    try {
      final suggestions = await services.searchService.suggest(
        query: _searchCtrl.text,
        mode: _mode,
        filters: _filters,
        currentLat: _position?.latitude,
        currentLng: _position?.longitude,
      );
      if (!mounted) return;
      setState(() => _suggestions = suggestions);
    } finally {
      if (mounted) {
        setState(() => _searchLoading = false);
      }
    }
  }

  Future<void> _openFilterSheet() async {
    final selected = await showModalBottomSheet<SearchFilters>(
      context: context,
      builder: (context) => _MapFilterSheet(initial: _filters),
    );
    if (selected != null) {
      setState(() => _filters = selected);
      await _refreshContexts(force: true);
      await _search();
    }
  }

  Future<void> _onSuggestionTap(SearchSuggestion item) async {
    if (item.lat != null && item.lng != null) {
      await _focusOnCoordinates(item.lat!, item.lng!, zoom: 16.2);
    }
    final contexts = ref.read(mapContextsProvider);
    final matched = contexts.firstWhere(
      (ctx) =>
          item.type == SearchResultType.place && item.id == 'place:${ctx.id}',
      orElse: () =>
          _selectedContext ??
          (contexts.isNotEmpty ? contexts.first : const MapContextItem(id: 0, name: '')),
    );
    if (matched.id != 0 && mounted) {
      setState(() => _selectedContext = matched);
    }
  }

  Future<void> _focusFromSearchResult(SearchSuggestion item) async {
    _searchCtrl.text = item.title;
    await _search();
    if (item.lat != null && item.lng != null) {
      await _focusOnCoordinates(item.lat!, item.lng!, zoom: 16.2);
    }

    final contexts = ref.read(mapContextsProvider);
    final matched = contexts.firstWhere(
      (ctx) => item.id == 'place:${ctx.id}',
      orElse: () => MapContextItem(
        id: int.tryParse(item.id.split(':').last) ?? 0,
        name: item.title,
        description: item.snippet,
        address: item.locationName,
        latitude: item.lat,
        longitude: item.lng,
        avgRating: item.rating,
      ),
    );
    if (!mounted) return;
    setState(() {
      _selectedContext = matched;
      if (contexts.every((ctx) => ctx.id != matched.id) && matched.id != 0) {
        // Option 1: You can add manually to provider if you want
        // ref.read(mapContextsProvider.notifier).state = [matched, ...contexts];
      }
    });
  }

  Future<void> _openDirections(MapContextItem contextItem) async {
    if (!contextItem.hasCoordinates) return;
    final uri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=${contextItem.latitude},${contextItem.longitude}',
    );
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Future<void> _saveToPrivateWorld(MapContextItem contextItem) async {
    final services = AppServicesScope.read(context);
    await services.searchService.saveToPrivateWorld(contextItem);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Saved "${contextItem.name}" to Private World')),
    );
    if (_mode == SearchWorldMode.privateWorld) {
      await _refreshContexts(force: true);
    }
  }

  void _evaluateStayPrompt(geo.Position position) {
    if (_mode != SearchWorldMode.open) return;

    MapContextItem? nearest;
    double nearestDistance = double.infinity;
    final contexts = ref.read(mapContextsProvider);
    for (final contextItem in contexts) {
      if (!contextItem.hasCoordinates) continue;
      final d = geo.Geolocator.distanceBetween(
        position.latitude,
        position.longitude,
        contextItem.latitude!,
        contextItem.longitude!,
      );
      if (d < nearestDistance) {
        nearestDistance = d;
        nearest = contextItem;
      }
    }

    if (nearest == null || nearestDistance > 120) {
      _stayContextId = null;
      _stayStartedAt = null;
      return;
    }

    if (_stayContextId != nearest.id) {
      _stayContextId = nearest.id;
      _stayStartedAt = DateTime.now();
      return;
    }

    if (_stayStartedAt == null) return;
    final stayedDuration = DateTime.now().difference(_stayStartedAt!);
    if (stayedDuration < const Duration(hours: 1)) return;
    if (_stayPromptedContextIds.contains(nearest.id)) return;
    _stayPromptedContextIds.add(nearest.id);
    _showStayPrompt(nearest);
  }

  Future<void> _showStayPrompt(MapContextItem contextItem) async {
    if (!mounted) return;
    await showModalBottomSheet<void>(
      context: context,
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Bạn vừa ở ${contextItem.name} hơn 1 giờ?',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 6),
              Text(
                'Bạn muốn review chỗ này không? Nếu chưa muốn viết đủ 100 từ, có thể lưu tim hoặc đặt cọc.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: FilledButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _openReviewComposer(contextItem);
                      },
                      child: const Text('Review now'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        Navigator.pop(context);
                        await _saveToPrivateWorld(contextItem);
                      },
                      icon: const Icon(Icons.favorite_outline),
                      label: const Text('Save heart'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _openReviewComposer(MapContextItem contextItem) async {
    await showModalBottomSheet<void>(
      isScrollControlled: true,
      context: context,
      builder: (context) => _ReviewComposerSheet(
        place: contextItem,
        onSavePrivate: () => _saveToPrivateWorld(contextItem),
        onPublish: (draft) => _publishReview(contextItem, draft),
      ),
    );
  }

  Future<String> _publishReview(
    MapContextItem contextItem,
    _ReviewDraft draft,
  ) async {
    final services = AppServicesScope.read(context);
    try {
      final result = await services.mapRepository.publishReview(
        placeId: contextItem.id,
        request: PublishReviewRequest(
          stars: draft.stars,
          content: draft.content,
          visibility: draft.visibility,
          depositAmount: draft.depositAmount,
          isPremium: draft.visibility == MapReviewVisibility.premium,
        ),
      );
      await _refreshContexts(force: true);
      final depositText = result.depositAmount > 0
          ? ' + deposit ${result.depositAmount} KNOW-U'
          : '';
      return 'Review published (${result.wordCount} words$depositText).';
    } on ApiException catch (error) {
      // Fallback to legacy context review API when mobile endpoint is not mounted yet.
      if (error.statusCode == 404 || error.statusCode == 405) {
        await services.mapRepository.upsertContextReview(
          contextId: contextItem.id,
          stars: draft.stars,
          comment: draft.content,
        );
        await _refreshContexts(force: true);
        return 'Review published via fallback endpoint.';
      }
      rethrow;
    }
  }

  Future<void> _downloadWorldToPrivate({required bool wholeArea}) async {
    final services = AppServicesScope.read(context);
    setState(() => _importingWorld = true);
    try {
      try {
        final result = await services.mapRepository.importWorld(
          full: wholeArea,
          region: wholeArea || _position == null
              ? null
              : WorldImportBounds(
                  minLat: _position!.latitude - 0.08,
                  minLng: _position!.longitude - 0.08,
                  maxLat: _position!.latitude + 0.08,
                  maxLng: _position!.longitude + 0.08,
                ),
        );
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Imported ${result.imported} places from ${result.mode} world.',
             ),
          ),
        );
      } on ApiException catch (error) {
        if (error.statusCode != 404 && error.statusCode != 405) rethrow;
        final contexts = ref.read(mapContextsProvider);
        final source = wholeArea
            ? contexts
            : contexts.take(60).toList(); // selected region sample for MVP
        await services.privateWorldStore.savePlaces(source);
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              wholeArea
                  ? 'Downloaded full public world to private (local fallback).'
                  : 'Downloaded selected region to private (local fallback).',
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _importingWorld = false);
    }
  }

  Future<void> _openCreatePlaceDialog() async {
    final position = _position;
    if (position == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Current location is not ready yet.')),
      );
      return;
    }

    final nameCtrl = TextEditingController();
    final categoryCtrl = TextEditingController(text: 'food');
    final addressCtrl = TextEditingController();

    final draft = await showDialog<_CreatePlaceDraft>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Add place to Open World'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: 'Place name'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: categoryCtrl,
                decoration: const InputDecoration(labelText: 'Category'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: addressCtrl,
                decoration: const InputDecoration(labelText: 'Address'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                final name = nameCtrl.text.trim();
                if (name.isEmpty) return;
                Navigator.pop(
                  dialogContext,
                  _CreatePlaceDraft(
                    name: name,
                    category: categoryCtrl.text.trim(),
                    address: addressCtrl.text.trim(),
                  ),
                );
              },
              child: const Text('Create'),
            ),
          ],
        );
      },
    );

    nameCtrl.dispose();
    categoryCtrl.dispose();
    addressCtrl.dispose();
    if (draft == null) return;
    if (!mounted) return;

    final services = AppServicesScope.read(context);
    try {
      final place = await services.mapRepository.createPlace(
        CreatePlaceRequest(
          name: draft.name,
          latitude: position.latitude,
          longitude: position.longitude,
          category: draft.category.isNotEmpty ? draft.category : null,
          address: draft.address.isNotEmpty ? draft.address : null,
        ),
      );
      if (!mounted) return;
      await _refreshContexts(force: true);
      if (place.hasCoordinates) {
        await _focusOnCoordinates(place.latitude!, place.longitude!, zoom: 16.5);
      }
      if (!mounted) return;
      setState(() => _selectedContext = place);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Created place: ${place.name}')),
      );
    } on ApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final contexts = ref.watch(mapContextsProvider);
    
    // Auto update markers when contexts changes
    _renderContextAnnotations(contexts);

    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 20, 18, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(28),
              child: Stack(
                children: [
                  Positioned.fill(
                    child: MapboxConfig.hasToken
                        ? MapWidget(
                            key: const ValueKey('knowledge-share-map'),
                            onMapCreated: _onMapCreated,
                          )
                        : const _MapTokenFallback(),
                  ),
                  Positioned(
                    top: 12,
                    left: 12,
                    right: 12,
                    child: GlassCard(
                      borderRadius: 22,
                      child: Column(
                        children: [
                          KnowledgeSearchBar(
                            controller: _searchCtrl,
                            mode: _mode,
                            onModeChanged: (mode) async {
                              setState(() => _mode = mode);
                              await _refreshContexts(force: true);
                              await _search();
                            },
                            onChanged: _onSearchChanged,
                            onFilterTap: _openFilterSheet,
                            hintText:
                                'Search places, review text, or topics...',
                          ),
                          if (_searchLoading)
                            const LinearProgressIndicator(minHeight: 2),
                          if (_suggestions.isNotEmpty)
                            SizedBox(
                              height: 140,
                              child: ListView.builder(
                                itemCount: _suggestions.length.clamp(0, 6),
                                itemBuilder: (context, index) {
                                  final item = _suggestions[index];
                                  return ListTile(
                                    dense: true,
                                    leading: Icon(
                                      item.type == SearchResultType.place
                                          ? Icons.location_on_outlined
                                          : Icons.article_outlined,
                                    ),
                                    title: Text(item.title),
                                    subtitle: Text(item.subtitle),
                                    onTap: () => _onSuggestionTap(item),
                                  );
                                },
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    right: 12,
                    bottom: 220,
                    child: Column(
                      children: [
                        _MapRoundButton(
                          icon: Icons.my_location_rounded,
                          onTap: _focusOnUser,
                        ),
                        const SizedBox(height: 10),
                        _MapRoundButton(
                          icon: Icons.add_location_alt_outlined,
                          onTap: _openCreatePlaceDialog,
                        ),
                        const SizedBox(height: 10),
                        PopupMenuButton<String>(
                          tooltip: 'Download public world',
                          enabled: !_importingWorld,
                          onSelected: (value) async {
                            await _downloadWorldToPrivate(
                              wholeArea: value == 'full',
                            );
                          },
                          itemBuilder: (context) => const [
                            PopupMenuItem(
                              value: 'region',
                              child: Text('Download selected region'),
                            ),
                            PopupMenuItem(
                              value: 'full',
                              child: Text('Download full public world'),
                            ),
                          ],
                          child: _MapRoundButton(
                            icon: _importingWorld
                                ? Icons.hourglass_top_rounded
                                : Icons.download_rounded,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Align(
                    alignment: Alignment.bottomCenter,
                    child: DraggableScrollableSheet(
                      initialChildSize: 0.24,
                      minChildSize: 0.2,
                      maxChildSize: 0.6,
                      builder: (context, controller) {
                        return Container(
                          decoration: const BoxDecoration(
                            color: Color(0xFFF8FAFF),
                            borderRadius: BorderRadius.vertical(
                              top: Radius.circular(24),
                            ),
                          ),
                          child: Column(
                            children: [
                              const SizedBox(height: 8),
                              Container(
                                width: 56,
                                height: 4,
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                              ),
                              if (_locationError != null)
                                Padding(
                                  padding: const EdgeInsets.all(10),
                                  child: Text(
                                    _locationError!,
                                    style: Theme.of(
                                      context,
                                    ).textTheme.bodySmall,
                                  ),
                                ),
                              if (_importingWorld)
                                const LinearProgressIndicator(minHeight: 2),
                              Expanded(
                                child: ListView.builder(
                                  controller: controller,
                                  itemCount: contexts.length.clamp(0, 120),
                                  itemBuilder: (context, index) {
                                    final place = contexts[index];
                                    final isSelected =
                                        _selectedContext?.id == place.id;
                                    return ListTile(
                                      selected: isSelected,
                                      selectedTileColor: KsColors.brandBlue
                                          .withValues(alpha: 0.08),
                                      title: Text(
                                        place.name,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      subtitle: Text(
                                        '${place.category ?? 'Place'} • ${(place.avgRating ?? 0).toStringAsFixed(1)}★',
                                      ),
                                      trailing: Wrap(
                                        spacing: 6,
                                        children: [
                                          IconButton(
                                            tooltip: 'Route',
                                            onPressed: place.hasCoordinates
                                                ? () => _openDirections(place)
                                                : null,
                                            icon: const Icon(
                                              Icons.route_outlined,
                                            ),
                                          ),
                                          IconButton(
                                            tooltip: 'Save to private world',
                                            onPressed: () =>
                                                _saveToPrivateWorld(place),
                                            icon: const Icon(
                                              Icons.favorite_outline,
                                            ),
                                          ),
                                        ],
                                      ),
                                      onTap: () async {
                                        setState(
                                          () => _selectedContext = place,
                                        );
                                        if (place.hasCoordinates) {
                                          await _focusOnCoordinates(
                                            place.latitude!,
                                            place.longitude!,
                                            zoom: 16.4,
                                          );
                                        }
                                      },
                                    );
                                  },
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.fromLTRB(
                                  14,
                                  8,
                                  14,
                                  14,
                                ),
                                child: DecoratedBox(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(999),
                                    gradient: KsGradients.primaryButton,
                                  ),
                                  child: SizedBox(
                                    width: double.infinity,
                                    child: TextButton.icon(
                                      onPressed: _selectedContext == null
                                          ? null
                                          : () => _saveToPrivateWorld(
                                              _selectedContext!,
                                            ),
                                      icon: const Icon(
                                        Icons.favorite_outline,
                                        color: Colors.white,
                                      ),
                                      label: const Text(
                                        'Thêm vào bản đồ của tôi',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MapRoundButton extends StatelessWidget {
  const _MapRoundButton({required this.icon, this.onTap});

  final IconData icon;
  final Future<void> Function()? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white.withValues(alpha: 0.92),
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        borderRadius: BorderRadius.circular(999),
        onTap: onTap,
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: KsColors.brandBlue.withValues(alpha: 0.2),
            ),
          ),
          alignment: Alignment.center,
          child: Icon(icon, color: KsColors.textPrimary),
        ),
      ),
    );
  }
}

class _MapFilterSheet extends StatefulWidget {
  const _MapFilterSheet({required this.initial});

  final SearchFilters initial;

  @override
  State<_MapFilterSheet> createState() => _MapFilterSheetState();
}

class _MapFilterSheetState extends State<_MapFilterSheet> {
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
        children: [
          Text('Map Filters', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 10),
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
            onChanged: (value) => setState(() => _nearbyOnly = value),
            title: const Text('Nearly come only'),
          ),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            value: _recentOnly,
            onChanged: (value) => setState(() => _recentOnly = value),
            title: const Text('Recent reviews'),
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

class _MapTokenFallback extends StatelessWidget {
  const _MapTokenFallback();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            KsColors.brandBlue.withValues(alpha: 0.22),
            KsColors.brandViolet.withValues(alpha: 0.2),
          ],
        ),
      ),
      child: Center(
        child: GlassCard(
          padding: const EdgeInsets.all(18),
          child: Text(
            'Mapbox token missing.\nRun with --dart-define=MAPBOX_ACCESS_TOKEN=your_token',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}

class _ReviewComposerSheet extends StatefulWidget {
  const _ReviewComposerSheet({
    required this.place,
    required this.onSavePrivate,
    required this.onPublish,
  });

  final MapContextItem place;
  final Future<void> Function() onSavePrivate;
  final Future<String> Function(_ReviewDraft draft) onPublish;

  @override
  State<_ReviewComposerSheet> createState() => _ReviewComposerSheetState();
}

class _ReviewComposerSheetState extends State<_ReviewComposerSheet> {
  final _reviewCtrl = TextEditingController();
  int _stars = 5;
  bool _isPublic = true;
  bool _isPremium = false;
  double _deposit = 0;
  bool _submitting = false;

  int get _wordCount {
    final text = _reviewCtrl.text.trim();
    if (text.isEmpty) return 0;
    return text.split(RegExp(r'\s+')).where((e) => e.isNotEmpty).length;
  }

  MapReviewVisibility get _visibility {
    if (_isPremium) return MapReviewVisibility.premium;
    if (_isPublic) return MapReviewVisibility.publicWorld;
    return MapReviewVisibility.privateWorld;
  }

  Future<void> _submitPublish() async {
    final review = _reviewCtrl.text.trim();
    if (review.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Review content is required.')),
      );
      return;
    }

    final validPublic = !_isPublic || _wordCount >= 100 || _deposit > 0;
    if (!validPublic) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Public review cần >=100 từ hoặc có đặt cọc.'),
        ),
      );
      return;
    }

    setState(() => _submitting = true);
    final messenger = ScaffoldMessenger.of(context);
    try {
      final message = await widget.onPublish(
        _ReviewDraft(
          stars: _stars,
          content: review,
          visibility: _visibility,
          depositAmount: _deposit.round(),
        ),
      );
      if (!mounted) return;
      messenger.showSnackBar(SnackBar(content: Text(message)));
      Navigator.pop(context);
    } on ApiException catch (error) {
      if (!mounted) return;
      messenger.showSnackBar(SnackBar(content: Text(error.message)));
    } catch (error) {
      if (!mounted) return;
      messenger.showSnackBar(SnackBar(content: Text('Publish failed: $error')));
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  void dispose() {
    _reviewCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 18,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Review ${widget.place.name}',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _reviewCtrl,
            maxLines: 6,
            decoration: InputDecoration(
              hintText:
                  'Write detailed review (100+ words for public world)...',
              helperText: 'Word count: $_wordCount',
            ),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Text('Rating'),
              const SizedBox(width: 8),
              Expanded(
                child: Slider(
                  value: _stars.toDouble(),
                  min: 1,
                  max: 5,
                  divisions: 4,
                  label: '$_stars stars',
                  onChanged: (value) {
                    setState(() => _stars = value.round());
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            value: _isPublic,
            onChanged: (v) {
              setState(() {
                _isPublic = v;
                if (!v) _isPremium = false;
              });
            },
            title: const Text('Publish to Open World'),
          ),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            value: _isPremium,
            onChanged: _isPublic
                ? (v) => setState(() => _isPremium = v)
                : null,
            title: const Text('Set as Premium review'),
            subtitle: const Text(
              'Rule backend: user must have stable public history + upvote ratio.',
            ),
          ),
          if (_isPublic && _wordCount < 100)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Public review dưới 100 từ cần đặt cọc KNOW-U hoặc chuyển private world.',
                ),
                Slider(
                  value: _deposit,
                  min: 0,
                  max: 100,
                  divisions: 20,
                  label: _deposit.toStringAsFixed(0),
                  onChanged: (value) => setState(() => _deposit = value),
                ),
              ],
            ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: FilledButton(
                  onPressed: _submitting ? null : _submitPublish,
                  child: Text(_submitting ? 'Publishing...' : 'Publish review'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _submitting
                      ? null
                      : () async {
                    await widget.onSavePrivate();
                    if (!context.mounted) return;
                    Navigator.pop(context);
                  },
                  icon: const Icon(Icons.favorite_outline),
                  label: const Text('Move to private'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ReviewDraft {
  const _ReviewDraft({
    required this.stars,
    required this.content,
    required this.visibility,
    required this.depositAmount,
  });

  final int stars;
  final String content;
  final MapReviewVisibility visibility;
  final int depositAmount;
}

class _CreatePlaceDraft {
  const _CreatePlaceDraft({
    required this.name,
    required this.category,
    required this.address,
  });

  final String name;
  final String category;
  final String address;
}
