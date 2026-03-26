import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../../core/theme/app_theme.dart';
import '../../../../drawing/domain/models/drawing_tool.dart';
import '../../../../drawing/providers/tool_provider.dart';
import '../../../providers/canvas_provider.dart';
import '../../../providers/pdf_import_provider.dart';
import 'tool_picker_panel.dart';

class FavoritesBar extends ConsumerStatefulWidget {
  const FavoritesBar({super.key});

  @override
  ConsumerState<FavoritesBar> createState() => _FavoritesBarState();
}

class _FavoritesBarState extends ConsumerState<FavoritesBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _hideController;
  late Animation<double> _opacityAnim;

  @override
  void initState() {
    super.initState();
    _hideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _opacityAnim = Tween<double>(begin: 1.0, end: 0.2).animate(
      CurvedAnimation(parent: _hideController, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _hideController.dispose();
    super.dispose();
  }

  void _openToolPicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const ToolPickerPanel(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final drawingState = ref.watch(drawingStateProvider);
    final notifier = ref.read(drawingStateProvider.notifier);
    final favorites = drawingState.favorites;

    return FadeTransition(
      opacity: _opacityAnim,
      child: Container(
        height: 64.h,
        margin: EdgeInsets.symmetric(horizontal: 8.w, vertical: 6.h),
        decoration: BoxDecoration(
          color: AppTheme.primaryDark.withOpacity(0.95),
          borderRadius: BorderRadius.circular(20.r),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.35),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(width: 6.w),

            // Reorderable tool buttons
            ReorderableListView.builder(
              scrollDirection: Axis.horizontal,
              shrinkWrap: true,
              proxyDecorator: (child, _, __) => Material(
                color: Colors.transparent,
                child: child,
              ),
              itemCount: favorites.length,
              onReorder: (oldIndex, newIndex) {
                if (newIndex > oldIndex) newIndex--;
                final updated = List<ToolType>.from(favorites);
                final item = updated.removeAt(oldIndex);
                updated.insert(newIndex, item);
                notifier.reorderFavorites(updated);
              },
              itemBuilder: (ctx, index) {
                final toolType = favorites[index];
                final isActive = drawingState.activeTool == toolType;
                return _FavoriteToolButton(
                  key: ValueKey(toolType),
                  toolType: toolType,
                  isActive: isActive,
                  onTap: () {
                    if (toolType == ToolType.pdf) {
                      ref.read(pdfImportProvider.notifier).importToCanvas(ref);
                      notifier.selectTool(ToolType.none); // switch to pan mode
                    } else {
                      notifier.selectTool(toolType);
                    }
                  },
                  onLongPress: () => _showRemoveMenu(context, toolType, notifier),
                );
              },
            ),

            // Divider
            Container(
              width: 1,
              height: 32.h,
              color: Colors.white.withOpacity(0.15),
              margin: EdgeInsets.symmetric(horizontal: 4.w),
            ),

            // + Add button
            _AddToolButton(onTap: () => _openToolPicker(context)),

            // Divider
            Container(
              width: 1,
              height: 32.h,
              color: Colors.white.withOpacity(0.15),
              margin: EdgeInsets.symmetric(horizontal: 4.w),
            ),

            // Quick actions: Undo, Redo
            _QuickActionButton(
              icon: Icons.undo_rounded,
              tooltip: 'Undo',
              onTap: () => ref.read(canvasStateProvider.notifier).undo(),
            ),
            _QuickActionButton(
              icon: Icons.redo_rounded,
              tooltip: 'Redo',
              onTap: () => ref.read(canvasStateProvider.notifier).redo(),
            ),

            // Teaching Mode
            _QuickActionButton(
              icon: Icons.school_outlined,
              tooltip: 'Teaching Mode',
              onTap: () => ref.read(canvasStateProvider.notifier).toggleFullscreen(),
            ),

            SizedBox(width: 6.w),
          ],
        ),
      ),
    );
  }

  void _showRemoveMenu(
    BuildContext context,
    ToolType tool,
    DrawingStateNotifier notifier,
  ) {
    showDialog(
      context: context,
      barrierColor: Colors.transparent,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.primaryDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
        title: Text(
          'Remove from bar?',
          style: TextStyle(color: Colors.white, fontSize: 16.sp),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () {
              notifier.toggleFavorite(tool);
              Navigator.pop(context);
            },
            child: const Text('Remove', style: TextStyle(color: AppTheme.errorRed)),
          ),
        ],
      ),
    );
  }
}

// ─── Individual Favorite Tool Button ─────────────────────────────────────────
class _FavoriteToolButton extends StatefulWidget {
  final ToolType toolType;
  final bool isActive;
  final VoidCallback onTap;
  final VoidCallback onLongPress;

  const _FavoriteToolButton({
    super.key,
    required this.toolType,
    required this.isActive,
    required this.onTap,
    required this.onLongPress,
  });

  @override
  State<_FavoriteToolButton> createState() => _FavoriteToolButtonState();
}

class _FavoriteToolButtonState extends State<_FavoriteToolButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _scaleController;

  @override
  void initState() {
    super.initState();
    _scaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
      lowerBound: 0.9,
      upperBound: 1.0,
      value: 1.0,
    );
  }

  @override
  void dispose() {
    _scaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tool = _getToolInfo(widget.toolType);
    final categoryColor = _getCategoryColor(widget.toolType);

    return GestureDetector(
      onTap: () {
        _scaleController.reverse().then((_) => _scaleController.forward());
        widget.onTap();
      },
      onLongPress: widget.onLongPress,
      child: ScaleTransition(
        scale: _scaleController,
        child: Material(
          type: MaterialType.transparency,
          child: Container(
          width: 52.w,
          height: 52.h,
          margin: EdgeInsets.symmetric(horizontal: 4.w),
          decoration: BoxDecoration(
            color: widget.isActive ? categoryColor : Colors.white.withOpacity(0.06),
            borderRadius: BorderRadius.circular(14.r),
            border: widget.isActive
                ? Border.all(color: categoryColor.withOpacity(0.5), width: 1.5)
                : null,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                tool.icon,
                size: 20.sp,
                color: widget.isActive ? Colors.white : AppTheme.navColor,
              ),
              if (tool.label.isNotEmpty) ...[
                SizedBox(height: 2.h),
                DefaultTextStyle(
                  style: const TextStyle(decoration: TextDecoration.none),
                  child: Text(
                    tool.label,
                    style: TextStyle(
                      fontSize: 8.sp,
                      color: widget.isActive ? Colors.white : AppTheme.navColor,
                      fontWeight: FontWeight.w500,
                      decoration: TextDecoration.none,
                      decorationColor: Colors.transparent,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
        ),
      ),
    );
  }

  _ToolInfo _getToolInfo(ToolType type) {
    switch (type) {
      case ToolType.pen: return _ToolInfo(Icons.edit_outlined, 'Pen');
      case ToolType.pencil: return _ToolInfo(Icons.create_outlined, 'Pencil');
      case ToolType.highlighter: return _ToolInfo(Icons.highlight_outlined, 'Highlight');
      case ToolType.marker: return _ToolInfo(Icons.brush_outlined, 'Marker');
      case ToolType.eraser: return _ToolInfo(Icons.auto_fix_normal_outlined, 'Eraser');
      case ToolType.lasso: return _ToolInfo(Icons.highlight_alt_outlined, 'Lasso');
      case ToolType.shapes: return _ToolInfo(Icons.category_outlined, 'Shapes');
      case ToolType.text: return _ToolInfo(Icons.text_fields_outlined, 'Text');
      case ToolType.stickyNote: return _ToolInfo(Icons.note_add_outlined, 'Sticky');
      case ToolType.image: return _ToolInfo(Icons.image_outlined, 'Image');
      case ToolType.equation: return _ToolInfo(Icons.functions_outlined, 'Eq');
      case ToolType.laserPointer: return _ToolInfo(Icons.flash_on_outlined, 'Laser');
      case ToolType.ruler: return _ToolInfo(Icons.straighten_outlined, 'Ruler');
      case ToolType.pdf: return _ToolInfo(Icons.picture_as_pdf_outlined, 'PDF');
      default: return _ToolInfo(Icons.touch_app_outlined, 'Hand');
    }
  }

  Color _getCategoryColor(ToolType type) {
    switch (type) {
      case ToolType.pen:
      case ToolType.pencil:
      case ToolType.marker:
      case ToolType.highlighter:
      case ToolType.laserPointer:
        return AppTheme.drawColor;
      case ToolType.shapes:
        return AppTheme.shapeColor;
      case ToolType.text:
      case ToolType.stickyNote:
        return AppTheme.textColor;
      case ToolType.eraser:
      case ToolType.lasso:
        return AppTheme.eraserColor;
      case ToolType.ruler:
      case ToolType.protractor:
        return AppTheme.measureColor;
      case ToolType.equation:
      case ToolType.image:
      case ToolType.pdf:
        return const Color(0xFFF39C12); // Amber for Insert
      default:
        return AppTheme.navColor;
    }
  }
}

class _ToolInfo {
  final IconData icon;
  final String label;
  const _ToolInfo(this.icon, this.label);
}

// ─── +Add Button ──────────────────────────────────────────────────────────────
class _AddToolButton extends StatelessWidget {
  final VoidCallback onTap;
  const _AddToolButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Material(
        type: MaterialType.transparency,
        child: Container(
        width: 46.w,
        height: 46.h,
        margin: EdgeInsets.symmetric(horizontal: 4.w),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(
            color: AppTheme.primaryOrange.withOpacity(0.4),
            style: BorderStyle.solid,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_rounded, size: 18.sp, color: AppTheme.primaryOrange),
            SizedBox(height: 2.h),
            DefaultTextStyle(
              style: const TextStyle(decoration: TextDecoration.none),
              child: Text(
                'Add',
                style: TextStyle(
                  fontSize: 8.sp, 
                  color: AppTheme.primaryOrange,
                  decoration: TextDecoration.none,
                  decorationColor: Colors.transparent,
                ),
              ),
            ),
          ],
        ),
      ),
      ),
    );
  }
}

// ─── Quick Action Button ───────────────────────────────────────────────────────
class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;
  const _QuickActionButton({required this.icon, required this.tooltip, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10.r),
        child: Container(
          width: 36.w,
          height: 36.h,
          margin: EdgeInsets.symmetric(horizontal: 2.w),
          child: Icon(icon, size: 18.sp, color: Colors.white.withOpacity(0.7)),
        ),
      ),
    );
  }
}

// End of file
