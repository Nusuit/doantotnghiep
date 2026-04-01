import 'package:flutter/widgets.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../core/network/api_client.dart';
import '../core/storage/auth_token_store.dart';
import '../features/auth/data/auth_api.dart';
import '../features/explore/data/feed_repository.dart';
import '../features/map/data/map_repository.dart';
import '../features/search/data/private_world_store.dart';
import '../features/search/logic/search_service.dart';
import '../features/search/models/search_models.dart';

class AppServices {
  AppServices()
    : tokenStore = AuthTokenStore(const FlutterSecureStorage()),
      privateWorldStore = PrivateWorldStore(),
      searchFlow = SearchFlowCoordinator() {
    apiClient = ApiClient(tokenStore);
    authApi = AuthApi(apiClient);
    mapRepository = MapRepository(apiClient);
    feedRepository = FeedRepository(apiClient);
    searchService = SearchService(
      apiClient: apiClient,
      mapRepository: mapRepository,
      feedRepository: feedRepository,
      privateWorldStore: privateWorldStore,
    );
  }

  final AuthTokenStore tokenStore;
  final PrivateWorldStore privateWorldStore;
  final SearchFlowCoordinator searchFlow;

  late final ApiClient apiClient;
  late final AuthApi authApi;
  late final MapRepository mapRepository;
  late final FeedRepository feedRepository;
  late final SearchService searchService;
}

class AppServicesScope extends InheritedWidget {
  const AppServicesScope({
    super.key,
    required this.services,
    required super.child,
  });

  final AppServices services;

  static AppServices of(BuildContext context) {
    final scope = context
        .dependOnInheritedWidgetOfExactType<AppServicesScope>();
    assert(scope != null, 'AppServicesScope missing in widget tree');
    return scope!.services;
  }

  static AppServices read(BuildContext context) {
    final element = context
        .getElementForInheritedWidgetOfExactType<AppServicesScope>();
    final scope = element?.widget as AppServicesScope?;
    assert(scope != null, 'AppServicesScope missing in widget tree');
    return scope!.services;
  }

  @override
  bool updateShouldNotify(AppServicesScope oldWidget) =>
      oldWidget.services != services;
}

class SearchFlowCoordinator extends ChangeNotifier {
  int _currentTabIndex = 0;
  String _exploreQuery = '';
  SearchWorldMode _exploreMode = SearchWorldMode.open;
  SearchSuggestion? _selectedExploreResult;
  SearchSuggestion? _mapFocusResult;
  int _mapFocusVersion = 0;

  int get currentTabIndex => _currentTabIndex;
  String get exploreQuery => _exploreQuery;
  SearchWorldMode get exploreMode => _exploreMode;
  SearchSuggestion? get selectedExploreResult => _selectedExploreResult;
  SearchSuggestion? get mapFocusResult => _mapFocusResult;
  int get mapFocusVersion => _mapFocusVersion;

  void setCurrentTab(int index) {
    if (_currentTabIndex == index) return;
    _currentTabIndex = index;
    notifyListeners();
  }

  void openExplore({
    required String query,
    required SearchWorldMode mode,
    SearchSuggestion? selectedResult,
  }) {
    _exploreQuery = query.trim();
    _exploreMode = mode;
    _selectedExploreResult = selectedResult;
    _currentTabIndex = 1;
    notifyListeners();
  }

  void openMap(SearchSuggestion result) {
    _mapFocusResult = result;
    _mapFocusVersion += 1;
    _currentTabIndex = 2;
    notifyListeners();
  }

  void clearExploreQuery() {
    if (_exploreQuery.isEmpty && _selectedExploreResult == null) return;
    _exploreQuery = '';
    _exploreMode = SearchWorldMode.open;
    _selectedExploreResult = null;
    notifyListeners();
  }
}
