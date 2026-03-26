import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import 'package:eduhub_whiteboard/core/theme/app_theme.dart';
import 'package:eduhub_whiteboard/features/subjects/math/providers/math_tools_provider.dart';
import 'graph_plotter_dialog.dart';
import 'three_d_shape_builder_dialog.dart';
import 'optics_simulation_dialog.dart';
import 'package:eduhub_whiteboard/features/whiteboard/providers/whiteboard_provider.dart';
import 'package:eduhub_whiteboard/features/super_admin/providers/module_config_provider.dart';

class MathToolbar extends ConsumerWidget {
  const MathToolbar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedTool = ref.watch(selectedMathToolProvider);
    final moduleConfig = ref.watch(moduleConfigProvider);

    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildSectionTitle('Equation Editor'),
          SizedBox(height: 12.h),
          _buildEquationEditor(context, ref),
          SizedBox(height: 24.h),
          _buildSectionTitle('Quick Symbols'),
          SizedBox(height: 12.h),
          _buildSymbolGrid(context, ref),
          SizedBox(height: 24.h),
          _buildSectionTitle('Tools'),
          SizedBox(height: 12.h),
          _buildToolsGrid(context, ref, selectedTool, moduleConfig),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14.sp,
          fontWeight: FontWeight.w600,
          color: Colors.grey.shade700,
        ),
      ),
    );
  }

  Widget _buildEquationEditor(BuildContext context, WidgetRef ref) {
    final controller = TextEditingController();

    return Column(
      children: [
        Container(
          padding: EdgeInsets.all(12.w),
          decoration: BoxDecoration(
            color: AppTheme.canvasBlue,
            borderRadius: BorderRadius.circular(12.r),
          ),
          child: Column(
            children: [
              TextField(
                controller: controller,
                decoration: InputDecoration(
                  hintText: 'Enter LaTeX: x^2 + y^2 = r^2',
                  border: InputBorder.none,
                  hintStyle: TextStyle(color: Colors.grey.shade500),
                ),
                onChanged: (value) => ref.read(latexPreviewProvider.notifier).state = value,
              ),
              SizedBox(height: 12.h),
              Consumer(
                builder: (context, ref, child) {
                  final latex = ref.watch(latexPreviewProvider);
                  if (latex.isEmpty) return const SizedBox.shrink();
                  return Container(
                    padding: EdgeInsets.all(16.w),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    child: Math.tex(
                      latex,
                      textStyle: TextStyle(fontSize: 20.sp),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        SizedBox(height: 12.h),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () {
              final latex = ref.read(latexPreviewProvider);
              if (latex.isNotEmpty) {
                ref.read(whiteboardContentProvider.notifier).addLatex(latex);
                Navigator.pop(context);
              }
            },
            icon: const Icon(Icons.add),
            label: const Text('Insert to Canvas'),
          ),
        ),
      ],
    );
  }

  Widget _buildSymbolGrid(BuildContext context, WidgetRef ref) {
    final symbols = [
      ['\\sum', '∑'],
      ['\\int', '∫'],
      ['\\sqrt', '√'],
      ['\\pi', 'π'],
      ['\\theta', 'θ'],
      ['\\infty', '∞'],
      ['\\neq', '≠'],
      ['\\leq', '≤'],
      ['\\geq', '≥'],
      ['\\pm', '±'],
      ['\\cdot', '⋅'],
      ['\\div', '÷'],
      ['\\alpha', 'α'],
      ['\\beta', 'β'],
      ['\\gamma', 'γ'],
      ['\\delta', 'Δ'],
    ];

    return Wrap(
      spacing: 8.w,
      runSpacing: 8.h,
      children: symbols.map((symbol) {
        return InkWell(
          onTap: () {
            // Insert symbol into active text field
            ref.read(latexPreviewProvider.notifier).state += symbol[0];
          },
          child: Container(
            width: 48.w,
            height: 48.w,
            decoration: BoxDecoration(
              color: AppTheme.canvasBlue,
              borderRadius: BorderRadius.circular(8.r),
            ),
            child: Center(
              child: Text(
                symbol[1],
                style: TextStyle(
                  fontSize: 24.sp,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildToolsGrid(BuildContext context, WidgetRef ref, MathTool? selected, ModuleConfig moduleConfig) {
    final tools = [
      _ToolItem(
        icon: Icons.show_chart,
        label: 'Graph',
        tool: MathTool.graph,
      ),
      _ToolItem(
        icon: Icons.square_foot,
        label: 'Fraction',
        tool: MathTool.fraction,
      ),
      _ToolItem(
        icon: Icons.format_list_numbered,
        label: 'Matrix',
        tool: MathTool.matrix,
      ),
      _ToolItem(
        icon: Icons.linear_scale,
        label: 'Number Line',
        tool: MathTool.numberLine,
      ),
      _ToolItem(
        icon: Icons.architecture,
        label: 'Geometry',
        tool: MathTool.geometry,
      ),
      _ToolItem(
        icon: Icons.functions,
        label: 'Function',
        tool: MathTool.function,
      ),
      if (moduleConfig.shapeBuilder3D)
        _ToolItem(
          icon: Icons.view_in_ar,
          label: '3D Shapes',
          tool: MathTool.shapeBuilder,
        ),
      if (moduleConfig.physicsSimulations)
        _ToolItem(
          icon: Icons.science,
          label: 'Physics',
          tool: MathTool.physicsSim,
        ),
    ];

    return GridView.count(
      shrinkWrap: true,
      crossAxisCount: 3,
      mainAxisSpacing: 12.h,
      crossAxisSpacing: 12.w,
      children: tools.map((tool) {
        final isSelected = selected == tool.tool;
        return InkWell(
          onTap: () {
            ref.read(selectedMathToolProvider.notifier).state = tool.tool;
            _showToolDialog(context, ref, tool.tool);
          },
          child: Container(
            decoration: BoxDecoration(
              color: isSelected ? AppTheme.primaryOrange.withOpacity(0.1) : AppTheme.canvasBlue,
              borderRadius: BorderRadius.circular(12.r),
              border: isSelected
                  ? Border.all(color: AppTheme.primaryOrange, width: 2)
                  : null,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  tool.icon,
                  color: isSelected ? AppTheme.primaryOrange : Colors.grey.shade700,
                  size: 28.w,
                ),
                SizedBox(height: 4.h),
                Text(
                  tool.label,
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: isSelected ? AppTheme.primaryOrange : Colors.grey.shade700,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  void _showToolDialog(BuildContext context, WidgetRef ref, MathTool tool) {
    showDialog(
      context: context,
      builder: (context) {
        switch (tool) {
          case MathTool.graph:
            return const GraphPlotterDialog();
          case MathTool.fraction:
            return const DummyDialog(title: 'Fraction Builder');
          case MathTool.matrix:
            return const DummyDialog(title: 'Matrix Builder');
          case MathTool.numberLine:
            return const DummyDialog(title: 'Number Line');
          case MathTool.geometry:
            return const DummyDialog(title: 'Geometry Tool');
          case MathTool.function:
            return const DummyDialog(title: 'Function Plotter');
          case MathTool.shapeBuilder:
            return const ThreeDShapeBuilderDialog();
          case MathTool.physicsSim:
            return const OpticsSimulationDialog();
          default:
            return const SizedBox.shrink();
        }
      },
    );
  }
}

class _ToolItem {
  final IconData icon;
  final String label;
  final MathTool tool;

  _ToolItem({
    required this.icon,
    required this.label,
    required this.tool,
  });
}

class DummyDialog extends StatelessWidget {
  final String title;
  const DummyDialog({super.key, required this.title});
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(title),
      content: const Text('Implementation pending.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
      ],
    );
  }
}
