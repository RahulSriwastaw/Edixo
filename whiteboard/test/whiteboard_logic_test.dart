import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:eduboard_pro/features/whiteboard/presentation/providers/tool_provider.dart';

void main() {
  test('Whiteboard tool selection logic', () {
    final container = ProviderContainer();
    final ToolNotifier notifier = container.read(toolNotifierProvider.notifier);
    
    // Initial state check
    expect(container.read(toolNotifierProvider).activeTool, Tool.softPen);
    
    // Select highlighter
    notifier.selectTool(Tool.highlighter);
    expect(container.read(toolNotifierProvider).activeTool, Tool.highlighter);
    expect(container.read(toolNotifierProvider).interactionMode, InteractionMode.drawMode);
    
    // Select selection tool
    notifier.selectTool(Tool.select);
    expect(container.read(toolNotifierProvider).activeTool, Tool.select);
    expect(container.read(toolNotifierProvider).interactionMode, InteractionMode.selectMode);
  });
}
