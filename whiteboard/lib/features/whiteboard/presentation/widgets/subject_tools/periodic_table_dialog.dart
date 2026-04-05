// lib/features/whiteboard/presentation/widgets/subject_tools/periodic_table_dialog.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';

/// Periodic table reference for chemistry
class PeriodicTableDialog extends ConsumerWidget {
  const PeriodicTableDialog({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Dialog(
      backgroundColor: AppColors.bgPrimary,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
      ),
      child: Container(
        width: 900,
        height: 600,
        padding: const EdgeInsets.all(AppDimensions.borderRadiusL),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                const Icon(Icons.science, color: AppColors.accentOrange, size: 28),
                const SizedBox(width: AppDimensions.borderRadiusM),
                Text(
                  'Periodic Table',
                  style: AppTextStyles.heading2,
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textSecondary),
                  onPressed: () => context.pop(),
                ),
              ],
            ),
            const SizedBox(height: AppDimensions.borderRadiusM),

            // Periodic table grid
            Expanded(
              child: SingleChildScrollView(
                child: _PeriodicTableGrid(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PeriodicTableGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // Simplified periodic table with first 3 periods
    final elements = [
      // Period 1
      _Element(symbol: 'H', name: 'Hydrogen', number: 1, mass: 1.008, group: 1, period: 1, color: Colors.red),
      _Element(symbol: 'He', name: 'Helium', number: 2, mass: 4.003, group: 18, period: 1, color: Colors.blue),
      // Period 2
      _Element(symbol: 'Li', name: 'Lithium', number: 3, mass: 6.941, group: 1, period: 2, color: Colors.red),
      _Element(symbol: 'Be', name: 'Beryllium', number: 4, mass: 9.012, group: 2, period: 2, color: Colors.orange),
      _Element(symbol: 'B', name: 'Boron', number: 5, mass: 10.81, group: 13, period: 2, color: Colors.green),
      _Element(symbol: 'C', name: 'Carbon', number: 6, mass: 12.01, group: 14, period: 2, color: Colors.green),
      _Element(symbol: 'N', name: 'Nitrogen', number: 7, mass: 14.01, group: 15, period: 2, color: Colors.green),
      _Element(symbol: 'O', name: 'Oxygen', number: 8, mass: 16.00, group: 16, period: 2, color: Colors.green),
      _Element(symbol: 'F', name: 'Fluorine', number: 9, mass: 19.00, group: 17, period: 2, color: Colors.green),
      _Element(symbol: 'Ne', name: 'Neon', number: 10, mass: 20.18, group: 18, period: 2, color: Colors.blue),
      // Period 3
      _Element(symbol: 'Na', name: 'Sodium', number: 11, mass: 22.99, group: 1, period: 3, color: Colors.red),
      _Element(symbol: 'Mg', name: 'Magnesium', number: 12, mass: 24.31, group: 2, period: 3, color: Colors.orange),
      _Element(symbol: 'Al', name: 'Aluminum', number: 13, mass: 26.98, group: 13, period: 3, color: Colors.purple),
      _Element(symbol: 'Si', name: 'Silicon', number: 14, mass: 28.09, group: 14, period: 3, color: Colors.green),
      _Element(symbol: 'P', name: 'Phosphorus', number: 15, mass: 30.97, group: 15, period: 3, color: Colors.green),
      _Element(symbol: 'S', name: 'Sulfur', number: 16, mass: 32.07, group: 16, period: 3, color: Colors.green),
      _Element(symbol: 'Cl', name: 'Chlorine', number: 17, mass: 35.45, group: 17, period: 3, color: Colors.green),
      _Element(symbol: 'Ar', name: 'Argon', number: 18, mass: 39.95, group: 18, period: 3, color: Colors.blue),
    ];

    return SizedBox(
      width: 850,
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 18,
          childAspectRatio: 1.0,
          crossAxisSpacing: 4,
          mainAxisSpacing: 4,
        ),
        itemCount: 18 * 3,
        itemBuilder: (context, index) {
          final row = index ~/ 18;
          final col = index % 18;
          final element = elements.where((e) => e.period == row + 1 && e.group == col + 1).firstOrNull;

          if (element == null) {
            return const SizedBox.shrink();
          }

          return _ElementTile(element: element);
        },
      ),
    );
  }
}

class _ElementTile extends StatelessWidget {
  final _Element element;

  const _ElementTile({required this.element});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: element.color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: element.color, width: 1),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            element.number.toString(),
            style: const TextStyle(
              color: AppColors.textTertiary,
              fontSize: 8,
            ),
          ),
          Text(
            element.symbol,
            style: TextStyle(
              color: element.color,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            element.mass.toStringAsFixed(1),
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 7,
            ),
          ),
        ],
      ),
    );
  }
}

class _Element {
  final String symbol;
  final String name;
  final int number;
  final double mass;
  final int group;
  final int period;
  final Color color;

  _Element({
    required this.symbol,
    required this.name,
    required this.number,
    required this.mass,
    required this.group,
    required this.period,
    required this.color,
  });
}
