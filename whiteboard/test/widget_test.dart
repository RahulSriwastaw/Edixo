import 'package:flutter_test/flutter_test.dart';
import 'package:eduboard_pro/features/whiteboard/presentation/screens/whiteboard_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  testWidgets('Whiteboard screen loads', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: WhiteboardScreen(),
        ),
      ),
    );

    // Basic check that the screen rendered
    expect(find.byType(WhiteboardScreen), findsOneWidget);
  });
}
