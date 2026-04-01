import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:eduhub_whiteboard/features/whiteboard/providers/tool_provider.dart';

void main() {
  group('Whiteboard Tools Logical Tests', () {
    test('Tool pinning limits and behaviors', () {
      final container = ProviderContainer();
      final notifier = container.read(toolProvider.notifier);

      // Verify Initial Pinned Tools
      final initialPinned = container.read(toolProvider).pinnedTools;
      expect(initialPinned.contains(Tool.softPen), isTrue);

      // Add a generic shape tool
      notifier.pinTool(Tool.magicPen);
      
      final updatedState1 = container.read(toolProvider);
      expect(updatedState1.pinnedTools.contains(Tool.magicPen), isTrue, 
          reason: 'Magic Pen tool should be successfully pinned.');

      // Remove the pen
      notifier.unpinTool(Tool.softPen);
      
      final updatedState2 = container.read(toolProvider);
      expect(updatedState2.pinnedTools.contains(Tool.softPen), isFalse, 
          reason: 'Soft Pen should be unpinned.');
    });

    test('Tool selection state change', () {
      final container = ProviderContainer();
      final notifier = container.read(toolProvider.notifier);

      // Change tool to Eraser (using concrete type from enum)
      notifier.selectTool(Tool.softEraser);
      final active1 = container.read(toolProvider).activeTool;
      expect(active1, equals(Tool.softEraser), 
          reason: 'Active tool should register as Soft Eraser.');

      // Ensure switching to shapes works
      notifier.selectTool(Tool.circle);
      final active2 = container.read(toolProvider).activeTool;
      expect(active2, equals(Tool.circle), 
          reason: 'Active tool should register as Circle.');
    });
  });
}
