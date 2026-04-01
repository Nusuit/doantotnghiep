import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'src/app/knowledge_share_app.dart';
import 'src/core/config/mapbox_config.dart';

export 'src/app/knowledge_share_app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  MapboxConfig.initialize();
  runApp(
    const ProviderScope(
      child: KnowledgeShareApp(),
    ),
  );
}
