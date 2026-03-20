import 'package:flutter/material.dart';

import 'app_services.dart';
import '../features/auth/logic/auth_session.dart';
import '../features/explore/explore_screen.dart';
import '../features/home/home_screen.dart';
import '../features/map/map_screen.dart';
import '../features/profile/profile_screen.dart';
import '../shared/widgets/gradient_background.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key, required this.authSession});

  final AuthSession authSession;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _currentIndex = 0;
  AppServices? _services;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final services = AppServicesScope.of(context);
    if (_services == services) return;
    _services?.searchFlow.removeListener(_syncTabFromSearchFlow);
    _services = services;
    _services!.searchFlow.addListener(_syncTabFromSearchFlow);
  }

  @override
  void dispose() {
    _services?.searchFlow.removeListener(_syncTabFromSearchFlow);
    super.dispose();
  }

  void _syncTabFromSearchFlow() {
    final services = _services;
    if (services == null || !mounted) return;
    final nextIndex = services.searchFlow.currentTabIndex;
    if (_currentIndex == nextIndex) return;
    setState(() => _currentIndex = nextIndex);
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      const HomeScreen(),
      const ExploreScreen(),
      const MapScreen(),
      ProfileScreen(authSession: widget.authSession),
    ];

    return Scaffold(
      extendBody: true,
      body: GradientBackground(
        child: SafeArea(
          child: IndexedStack(index: _currentIndex, children: pages),
        ),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(16, 0, 16, 10),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(26),
          child: NavigationBar(
            selectedIndex: _currentIndex,
            labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
            onDestinationSelected: (index) {
              setState(() => _currentIndex = index);
              _services?.searchFlow.setCurrentTab(index);
            },
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home_rounded),
                label: 'Home',
              ),
              NavigationDestination(
                icon: Icon(Icons.explore_outlined),
                selectedIcon: Icon(Icons.explore_rounded),
                label: 'Explore',
              ),
              NavigationDestination(
                icon: Icon(Icons.map_outlined),
                selectedIcon: Icon(Icons.map_rounded),
                label: 'Map',
              ),
              NavigationDestination(
                icon: Icon(Icons.person_outline),
                selectedIcon: Icon(Icons.person_rounded),
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
