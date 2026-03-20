import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:knowledge_share/main.dart';

void main() {
  testWidgets('app boots without crash', (WidgetTester tester) async {
    await tester.pumpWidget(const KnowledgeShareApp());
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
