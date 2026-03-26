import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../data/elements_data.dart';
import 'package:eduhub_whiteboard/core/theme/app_theme.dart';

class PeriodicTableWidget extends StatefulWidget {
  final Function(ChemicalElement) onElementTap;

  const PeriodicTableWidget({
    super.key,
    required this.onElementTap,
  });

  @override
  State<PeriodicTableWidget> createState() => _PeriodicTableWidgetState();
}

class _PeriodicTableWidgetState extends State<PeriodicTableWidget> {
  ChemicalElement? _selectedElement;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 20.h),
      child: Container(
        width: 1000.w,
        height: 700.h,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24.r),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Row(
          children: [
            // Left: Periodic Table Grid
            Expanded(
              flex: 3,
              child: Padding(
                padding: EdgeInsets.all(24.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Interactive Periodic Table',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryOrange,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    SizedBox(height: 16.h),
                    Expanded(
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: SingleChildScrollView(
                          child: _buildTable(),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Right: Element Detail Panel
            if (_selectedElement != null)
              Container(
                width: 300.w,
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.only(
                    topRight: Radius.circular(24.r),
                    bottomRight: Radius.circular(24.r),
                  ),
                  border: Border(
                    left: BorderSide(color: Colors.grey.shade200),
                  ),
                ),
                padding: EdgeInsets.all(24.w),
                child: _buildDetailPanel(),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTable() {
    return Column(
      children: List.generate(7, (periodIndex) {
        final period = periodIndex + 1;
        return Row(
          children: List.generate(18, (groupIndex) {
            final group = groupIndex + 1;
            final element = ChemicalElements.data.cast<ChemicalElement?>().firstWhere(
              (e) => e?.period == period && e?.group == group,
              orElse: () => null,
            );

            if (element == null) {
              return SizedBox(
                width: 48.w,
                height: 58.h,
              );
            }

            return _buildElementCell(element);
          }),
        );
      }),
    );
  }

  Widget _buildElementCell(ChemicalElement element) {
    final isSelected = _selectedElement?.number == element.number;
    final categoryColor = _getCategoryColor(element.category);

    return InkWell(
      onTap: () {
        setState(() {
          _selectedElement = element;
        });
      },
      child: Container(
        width: 44.w,
        height: 54.h,
        margin: EdgeInsets.all(2.w),
        decoration: BoxDecoration(
          color: isSelected ? categoryColor : categoryColor.withOpacity(0.1),
          border: Border.all(
            color: categoryColor,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(6.r),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: categoryColor.withOpacity(0.4),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  )
                ]
              : [],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              element.number.toString(),
              style: TextStyle(
                fontSize: 9.sp,
                color: isSelected ? Colors.white : categoryColor,
              ),
            ),
            Text(
              element.symbol,
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : categoryColor,
              ),
            ),
            Text(
              element.name,
              style: TextStyle(
                fontSize: 7.sp,
                color: isSelected ? Colors.white : categoryColor,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailPanel() {
    final element = _selectedElement!;
    final color = _getCategoryColor(element.category);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Center(
          child: Container(
            width: 100.w,
            height: 120.h,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              border: Border.all(color: color, width: 3),
              borderRadius: BorderRadius.circular(16.r),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  element.number.toString(),
                  style: TextStyle(fontSize: 16.sp, color: color),
                ),
                Text(
                  element.symbol,
                  style: TextStyle(
                    fontSize: 40.sp,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
                Text(
                  element.atomicMass.toStringAsFixed(3),
                  style: TextStyle(fontSize: 12.sp, color: color),
                ),
              ],
            ),
          ),
        ),
        SizedBox(height: 24.h),
        Text(
          element.name,
          style: TextStyle(
            fontSize: 24.sp,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        Text(
          element.category.replaceAll('_', ' ').toUpperCase(),
          style: TextStyle(
            fontSize: 12.sp,
            fontWeight: FontWeight.w600,
            color: color,
            letterSpacing: 1.2,
          ),
        ),
        SizedBox(height: 16.h),
        const Text(
          'Description',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 8.h),
        Text(
          element.description,
          style: TextStyle(fontSize: 14.sp, height: 1.4),
        ),
        const Spacer(),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              widget.onElementTap(element);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryOrange,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(vertical: 16.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
            ),
            child: const Text('Add to Canvas'),
          ),
        ),
      ],
    );
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'non_metal':
        return Colors.green;
      case 'noble':
        return Colors.purple;
      case 'alkali':
        return Colors.red;
      case 'alkaline':
        return Colors.orange;
      case 'metalloid':
        return Colors.teal;
      case 'halogen':
        return Colors.blue;
      case 'post_transition':
        return Colors.blueGrey;
      default:
        return Colors.grey;
    }
  }
}
