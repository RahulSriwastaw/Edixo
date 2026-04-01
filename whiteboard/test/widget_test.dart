import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:eduhub_whiteboard/app.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  testWidgets('App launches', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: EduBoardApp()));
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
