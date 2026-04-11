// lib/features/whiteboard/presentation/widgets/panels/page_arrangement_panel.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../providers/slide_provider.dart';
import '../../providers/slide_capture_provider.dart';

class PageArrangementPanel extends ConsumerStatefulWidget {
  final Function(List<int> pageOrder, Set<int> deletedPages) onConfirm;
  final VoidCallback onCancel;

  const PageArrangementPanel({
    Key? key,
    required this.onConfirm,
    required this.onCancel,
  }) : super(key: key);

  @override
  ConsumerState<PageArrangementPanel> createState() => _PageArrangementPanelState();
}

class _PageArrangementState {
  final List<int> pageOrder;
  final Set<int> deletedPages;

  _PageArrangementState({
    required this.pageOrder,
    required this.deletedPages,
  });

  _PageArrangementState copyWith({
    List<int>? pageOrder,
    Set<int>? deletedPages,
  }) {
    return _PageArrangementState(
      pageOrder: pageOrder ?? List.from(this.pageOrder),
      deletedPages: deletedPages ?? Set.from(this.deletedPages),
    );
  }
}

class _PageArrangementPanelState extends ConsumerState<PageArrangementPanel> {
  late _PageArrangementState _currentState;
  final List<_PageArrangementState> _undoStack = [];
  final List<_PageArrangementState> _redoStack = [];

  @override
  void initState() {
    super.initState();
    final slideState = ref.read(slideNotifierProvider);
    _currentState = _PageArrangementState(
      pageOrder: List.generate(slideState.pages.length, (i) => i),
      deletedPages: {},
    );
  }

  void _addToHistory(_PageArrangementState state) {
    _undoStack.add(_currentState);
    _redoStack.clear();
    setState(() {
      _currentState = state;
    });
  }

  void _undo() {
    if (_undoStack.isNotEmpty) {
      _redoStack.add(_currentState);
      setState(() {
        _currentState = _undoStack.removeLast();
      });
    }
  }

  void _redo() {
    if (_redoStack.isNotEmpty) {
      _undoStack.add(_currentState);
      setState(() {
        _currentState = _redoStack.removeLast();
      });
    }
  }

  void _deletePageAt(int index) {
    final pageIndex = _currentState.pageOrder[index];
    final newOrder = List<int>.from(_currentState.pageOrder);
    newOrder.removeAt(index);
    final newDeleted = Set<int>.from(_currentState.deletedPages);
    newDeleted.add(pageIndex);

    _addToHistory(_PageArrangementState(
      pageOrder: newOrder,
      deletedPages: newDeleted,
    ));
  }

  void _restorePage(int pageIndex) {
    final newDeleted = Set<int>.from(_currentState.deletedPages);
    newDeleted.remove(pageIndex);
    final newOrder = List<int>.from(_currentState.pageOrder);
    if (!newOrder.contains(pageIndex)) {
      newOrder.add(pageIndex);
      newOrder.sort();
    }

    _addToHistory(_PageArrangementState(
      pageOrder: newOrder,
      deletedPages: newDeleted,
    ));
  }

  void _movePageUp(int index) {
    if (index > 0) {
      final newOrder = List<int>.from(_currentState.pageOrder);
      final temp = newOrder[index];
      newOrder[index] = newOrder[index - 1];
      newOrder[index - 1] = temp;

      _addToHistory(_PageArrangementState(
        pageOrder: newOrder,
        deletedPages: Set.from(_currentState.deletedPages),
      ));
    }
  }

  void _movePageDown(int index) {
    if (index < _currentState.pageOrder.length - 1) {
      final newOrder = List<int>.from(_currentState.pageOrder);
      final temp = newOrder[index];
      newOrder[index] = newOrder[index + 1];
      newOrder[index + 1] = temp;

      _addToHistory(_PageArrangementState(
        pageOrder: newOrder,
        deletedPages: Set.from(_currentState.deletedPages),
      ));
    }
  }

  void _resetAllChanges() {
    final slideState = ref.read(slideNotifierProvider);
    final newState = _PageArrangementState(
      pageOrder: List.generate(slideState.pages.length, (i) => i),
      deletedPages: {},
    );
    _addToHistory(newState);
  }

  @override
  Widget build(BuildContext context) {
    final slideState = ref.watch(slideNotifierProvider);
    final cachedSlides = ref.watch(slideCaptureProvider);
    final isMobile = MediaQuery.of(context).size.width < 768;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgPrimary,
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.blue.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.auto_awesome,
                        color: Colors.blue,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Arrange Class Pages',
                            style: AppTextStyles.heading2.copyWith(fontSize: 18),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Organize, delete, or reorder pages before exporting to PDF',
                            style: AppTextStyles.caption.copyWith(
                              color: AppColors.textTertiary,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: Colors.blue.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: Colors.blue[300],
                        size: 16,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Total Pages: ${_currentState.pageOrder.length} | Deleted: ${_currentState.deletedPages.length}',
                          style: AppTextStyles.caption.copyWith(
                            color: Colors.blue[300],
                            fontSize: 12,
                          ),
                        ),
                      ),
                      // Undo/Redo buttons
                      const SizedBox(width: 12),
                      Tooltip(
                        message: 'Undo (Ctrl+Z)',
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: _undoStack.isEmpty ? null : _undo,
                            borderRadius: BorderRadius.circular(6),
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              child: Icon(
                                Icons.undo,
                                size: 16,
                                color: _undoStack.isEmpty
                                    ? Colors.grey.withValues(alpha: 0.3)
                                    : Colors.blue[300],
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Tooltip(
                        message: 'Redo (Ctrl+Y)',
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: _redoStack.isEmpty ? null : _redo,
                            borderRadius: BorderRadius.circular(6),
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              child: Icon(
                                Icons.redo,
                                size: 16,
                                color: _redoStack.isEmpty
                                    ? Colors.grey.withValues(alpha: 0.3)
                                    : Colors.blue[300],
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Tooltip(
                        message: 'Reset All Changes',
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: _resetAllChanges,
                            borderRadius: BorderRadius.circular(6),
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              child: Icon(
                                Icons.refresh,
                                size: 16,
                                color: Colors.orange[300],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Pages Grid - with Drag & Drop support
          Expanded(
            child: _currentState.pageOrder.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.layers_clear,
                          size: 48,
                          color: AppColors.textTertiary.withValues(alpha: 0.5),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'No pages to display',
                          style: AppTextStyles.body.copyWith(
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: isMobile
                        ? _buildVerticalDraggableLayout(cachedSlides)
                        : _buildGridDraggableLayout(cachedSlides),
                  ),
          ),

          // Deleted Pages Section (if any)
          if (_currentState.deletedPages.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
                ),
                color: Colors.red.withValues(alpha: 0.05),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        'Deleted Pages (${_currentState.deletedPages.length})',
                        style: AppTextStyles.caption.copyWith(
                          color: Colors.red[400],
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Spacer(),
                      if (_currentState.deletedPages.isNotEmpty)
                        TextButton(
                          onPressed: () {
                            final newState = _PageArrangementState(
                              pageOrder: List<int>.from(_currentState.pageOrder)
                                ..addAll(_currentState.deletedPages)
                                ..sort(),
                              deletedPages: {},
                            );
                            _addToHistory(newState);
                          },
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                          ),
                          child: Text(
                            'Restore All',
                            style: AppTextStyles.caption.copyWith(
                              color: Colors.red[400],
                              fontSize: 11,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _currentState.deletedPages.map((pageIndex) {
                      return GestureDetector(
                        onTap: () => _restorePage(pageIndex),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.red.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: Colors.red.withValues(alpha: 0.3),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Page ${pageIndex + 1}',
                                style: AppTextStyles.caption.copyWith(
                                  color: Colors.red[400],
                                  fontSize: 11,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Icon(
                                Icons.restore,
                                size: 14,
                                color: Colors.red[400],
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),

          // Footer Actions
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: widget.onCancel,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      'Cancel',
                      style: AppTextStyles.body.copyWith(
                        color: AppColors.textTertiary,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _currentState.pageOrder.isEmpty
                        ? null
                        : _handleConfirm,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      disabledBackgroundColor: Colors.grey.withValues(alpha: 0.3),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ).copyWith(
                      overlayColor: WidgetStateProperty.all(Colors.white10),
                    ),
                    child: Text(
                      'Export (${_currentState.pageOrder.length} pages)',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGridDraggableLayout(Map<int, dynamic> cachedSlides) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 16 / 9, // 16:9 aspect ratio
      ),
      itemCount: _currentState.pageOrder.length,
      itemBuilder: (context, index) {
        final pageIndex = _currentState.pageOrder[index];
        final thumbnail = cachedSlides[pageIndex];

        return _PageDraggableThumbnailCard(
          index: index,
          pageNumber: pageIndex + 1,
          displayOrder: index + 1,
          thumbnail: thumbnail,
          onDelete: () => _deletePageAt(index),
          onMoveUp: index > 0 ? () => _movePageUp(index) : null,
          onMoveDown: index < _currentState.pageOrder.length - 1 ? () => _movePageDown(index) : null,
          onReorder: (fromIndex, toIndex) {
            final newOrder = List<int>.from(_currentState.pageOrder);
            if (fromIndex < toIndex) {
              toIndex -= 1;
            }
            final item = newOrder.removeAt(fromIndex);
            newOrder.insert(toIndex, item);
            _addToHistory(_PageArrangementState(
              pageOrder: newOrder,
              deletedPages: Set.from(_currentState.deletedPages),
            ));
          },
        );
      },
    );
  }

  Widget _buildVerticalDraggableLayout(Map<int, dynamic> cachedSlides) {
    return Column(
      children: List.generate(_currentState.pageOrder.length, (index) {
        final pageIndex = _currentState.pageOrder[index];
        final thumbnail = cachedSlides[pageIndex];

        return Column(
          children: [
            _PageDraggableListItem(
              index: index,
              pageNumber: pageIndex + 1,
              displayOrder: index + 1,
              thumbnail: thumbnail,
              onDelete: () => _deletePageAt(index),
              onMoveUp: index > 0 ? () => _movePageUp(index) : null,
              onMoveDown: index < _currentState.pageOrder.length - 1 ? () => _movePageDown(index) : null,
              onReorder: (fromIndex, toIndex) {
                final newOrder = List<int>.from(_currentState.pageOrder);
                if (fromIndex < toIndex) {
                  toIndex -= 1;
                }
                final item = newOrder.removeAt(fromIndex);
                newOrder.insert(toIndex, item);
                _addToHistory(_PageArrangementState(
                  pageOrder: newOrder,
                  deletedPages: Set.from(_currentState.deletedPages),
                ));
              },
            ),
            if (index < _currentState.pageOrder.length - 1)
              const SizedBox(height: 12),
          ],
        );
      }),
    );
  }

  Widget _buildGridPageLayout(Map<int, dynamic> cachedSlides) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 16 / 9, // 16:9 aspect ratio
      ),
      itemCount: _currentState.pageOrder.length,
      itemBuilder: (context, index) {
        final pageIndex = _currentState.pageOrder[index];
        final thumbnail = cachedSlides[pageIndex];

        return _PageThumbnailCard(
          pageNumber: pageIndex + 1,
          displayOrder: index + 1,
          thumbnail: thumbnail,
          onDelete: () => _deletePageAt(index),
          onMoveUp: index > 0 ? () => _movePageUp(index) : null,
          onMoveDown: index < _currentState.pageOrder.length - 1 ? () => _movePageDown(index) : null,
        );
      },
    );
  }

  void _handleConfirm() {
    // Pass the current state to the callback
    widget.onConfirm(_currentState.pageOrder, _currentState.deletedPages);
  }
}

class _PageThumbnailCard extends StatefulWidget {
  final int pageNumber;
  final int displayOrder;
  final dynamic thumbnail;
  final VoidCallback onDelete;
  final VoidCallback? onMoveUp;
  final VoidCallback? onMoveDown;

  const _PageThumbnailCard({
    Key? key,
    required this.pageNumber,
    required this.displayOrder,
    required this.thumbnail,
    required this.onDelete,
    this.onMoveUp,
    this.onMoveDown,
  }) : super(key: key);

  @override
  State<_PageThumbnailCard> createState() => _PageThumbnailCardState();
}

class _PageThumbnailCardState extends State<_PageThumbnailCard> {
  bool _showPreview = false;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return MouseRegion(
          onEnter: (_) => setState(() => _showPreview = true),
          onExit: (_) => setState(() => _showPreview = false),
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.bgSecondary,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.1),
              ),
            ),
            child: Stack(
              children: [
                // Thumbnail
                Column(
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.3),
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(8),
                            topRight: Radius.circular(8),
                          ),
                        ),
                        child: widget.thumbnail != null
                            ? Image.memory(
                                widget.thumbnail,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => _buildPlaceholder(),
                              )
                            : _buildPlaceholder(),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        border: Border(
                          top: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Page ${widget.displayOrder}',
                            style: AppTextStyles.caption.copyWith(
                              fontWeight: FontWeight.w600,
                              fontSize: 11,
                            ),
                          ),
                          Text(
                            '(Slide ${widget.pageNumber})',
                            style: AppTextStyles.caption.copyWith(
                              color: AppColors.textTertiary,
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                // Overlay Actions
                if (_showPreview)
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (widget.onMoveUp != null)
                              _ActionButton(
                                icon: Icons.arrow_upward,
                                tooltip: 'Move Up',
                                onPressed: widget.onMoveUp!,
                              ),
                            const SizedBox(width: 8),
                            if (widget.onMoveDown != null)
                              _ActionButton(
                                icon: Icons.arrow_downward,
                                tooltip: 'Move Down',
                                onPressed: widget.onMoveDown!,
                              ),
                            const SizedBox(width: 8),
                            _ActionButton(
                              icon: Icons.delete_outline,
                              tooltip: 'Delete',
                              onPressed: widget.onDelete,
                              color: Colors.red,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: Colors.grey.withValues(alpha: 0.2),
      child: Icon(
        Icons.image_not_supported,
        color: AppColors.textTertiary.withValues(alpha: 0.5),
        size: 24,
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onPressed;
  final Color color;

  const _ActionButton({
    Key? key,
    required this.icon,
    required this.tooltip,
    required this.onPressed,
    this.color = Colors.blue,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Container(
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: color.withValues(alpha: 0.5)),
        ),
        child: IconButton(
          icon: Icon(icon, color: color, size: 18),
          onPressed: onPressed,
          iconSize: 18,
          splashRadius: 20,
          padding: const EdgeInsets.all(6),
          constraints: const BoxConstraints(),
        ),
      ),
    );
  }
}

class _PageCompactListItem extends StatelessWidget {
  final int pageNumber;
  final int displayOrder;
  final dynamic thumbnail;
  final VoidCallback onDelete;
  final VoidCallback? onMoveUp;
  final VoidCallback? onMoveDown;

  const _PageCompactListItem({
    Key? key,
    required this.pageNumber,
    required this.displayOrder,
    required this.thumbnail,
    required this.onDelete,
    this.onMoveUp,
    this.onMoveDown,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Row(
        children: [
          // Thumbnail
          Container(
            width: 60,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: thumbnail != null
                  ? Image.memory(thumbnail, fit: BoxFit.cover)
                  : Icon(
                      Icons.image_not_supported,
                      color: AppColors.textTertiary.withValues(alpha: 0.5),
                    ),
            ),
          ),
          const SizedBox(width: 12),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Page ${displayOrder}',
                  style: AppTextStyles.body.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                Text(
                  'Slide ${pageNumber}',
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.textTertiary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),

          // Actions
          Row(
            children: [
              if (onMoveUp != null)
                IconButton(
                  icon: const Icon(Icons.arrow_upward),
                  onPressed: onMoveUp,
                  iconSize: 18,
                  splashRadius: 20,
                  padding: const EdgeInsets.all(4),
                  constraints: const BoxConstraints(),
                ),
              if (onMoveDown != null)
                IconButton(
                  icon: const Icon(Icons.arrow_downward),
                  onPressed: onMoveDown,
                  iconSize: 18,
                  splashRadius: 20,
                  padding: const EdgeInsets.all(4),
                  constraints: const BoxConstraints(),
                ),
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Colors.red),
                onPressed: onDelete,
                iconSize: 18,
                splashRadius: 20,
                padding: const EdgeInsets.all(4),
                constraints: const BoxConstraints(),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAGGABLE PAGE WIDGETS - For Drag & Drop Support
// ═══════════════════════════════════════════════════════════════════════════

class _PageDraggableThumbnailCard extends StatefulWidget {
  final int index;
  final int pageNumber;
  final int displayOrder;
  final dynamic thumbnail;
  final VoidCallback onDelete;
  final VoidCallback? onMoveUp;
  final VoidCallback? onMoveDown;
  final Function(int, int) onReorder;

  const _PageDraggableThumbnailCard({
    Key? key,
    required this.index,
    required this.pageNumber,
    required this.displayOrder,
    required this.thumbnail,
    required this.onDelete,
    required this.onReorder,
    this.onMoveUp,
    this.onMoveDown,
  }) : super(key: key);

  @override
  State<_PageDraggableThumbnailCard> createState() => _PageDraggableThumbnailCardState();
}

class _PageDraggableThumbnailCardState extends State<_PageDraggableThumbnailCard>
    with SingleTickerProviderStateMixin {
  bool _showPreview = false;
  bool _isDragging = false;
  late AnimationController _dragAnimController;

  @override
  void initState() {
    super.initState();
    _dragAnimController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _dragAnimController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Draggable<int>(
      data: widget.index,
      feedback: ScaleTransition(
        scale: Tween<double>(begin: 1.0, end: 1.1).animate(_dragAnimController),
        child: _buildCard(isDragging: true),
      ),
      onDragStarted: () {
        setState(() => _isDragging = true);
        _dragAnimController.forward();
      },
      onDraggableCanceled: (_, __) {
        setState(() => _isDragging = false);
        _dragAnimController.reverse();
      },
      childWhenDragging: Opacity(
        opacity: 0.5,
        child: _buildCard(isDragging: false),
      ),
      onDragCompleted: () {
        setState(() => _isDragging = false);
        _dragAnimController.reverse();
      },
      child: DragTarget<int>(
        onAccept: (receivedIndex) {
          widget.onReorder(receivedIndex, widget.index);
        },
        onWillAccept: (receivedIndex) {
          return receivedIndex != widget.index;
        },
        builder: (context, candidateData, rejectedData) {
          return _buildCard(
            isDragging: false,
            isDragTarget: candidateData.isNotEmpty,
          );
        },
      ),
    );
  }

  Widget _buildCard({
    required bool isDragging,
    bool isDragTarget = false,
  }) {
    return MouseRegion(
      onEnter: (_) => setState(() => _showPreview = true),
      onExit: (_) => setState(() => _showPreview = false),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.bgSecondary,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isDragTarget
                ? Colors.blue.withValues(alpha: 0.8)
                : Colors.white.withValues(alpha: 0.1),
            width: isDragTarget ? 2 : 1,
          ),
          boxShadow: isDragging || isDragTarget
              ? [
                  BoxShadow(
                    color: Colors.blue.withValues(alpha: 0.5),
                    blurRadius: 12,
                    spreadRadius: 2,
                  ),
                ]
              : null,
        ),
        child: Stack(
          children: [
            // Thumbnail
            Column(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.3),
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(8),
                        topRight: Radius.circular(8),
                      ),
                    ),
                    child: widget.thumbnail != null
                        ? Image.memory(
                            widget.thumbnail,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => _buildPlaceholder(),
                          )
                        : _buildPlaceholder(),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Page ${widget.displayOrder}',
                        style: AppTextStyles.caption.copyWith(
                          fontWeight: FontWeight.w600,
                          fontSize: 11,
                        ),
                      ),
                      Text(
                        '(Slide ${widget.pageNumber})',
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.textTertiary,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // Drag Indicator (top-left corner)
            Positioned(
              top: 4,
              left: 4,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.blue.withValues(alpha: 0.8),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Icon(
                  Icons.drag_handle,
                  color: Colors.white,
                  size: 14,
                ),
              ),
            ),

            // Overlay Actions
            if (_showPreview && !isDragging)
              Container(
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.7),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (widget.onMoveUp != null)
                          _ActionButton(
                            icon: Icons.arrow_upward,
                            tooltip: 'Move Up',
                            onPressed: widget.onMoveUp!,
                          ),
                        const SizedBox(width: 8),
                        if (widget.onMoveDown != null)
                          _ActionButton(
                            icon: Icons.arrow_downward,
                            tooltip: 'Move Down',
                            onPressed: widget.onMoveDown!,
                          ),
                        const SizedBox(width: 8),
                        _ActionButton(
                          icon: Icons.delete_outline,
                          tooltip: 'Delete',
                          onPressed: widget.onDelete,
                          color: Colors.red,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: Colors.grey.withValues(alpha: 0.2),
      child: Icon(
        Icons.image_not_supported,
        color: AppColors.textTertiary.withValues(alpha: 0.5),
        size: 24,
      ),
    );
  }
}

class _PageDraggableListItem extends StatefulWidget {
  final int index;
  final int pageNumber;
  final int displayOrder;
  final dynamic thumbnail;
  final VoidCallback onDelete;
  final VoidCallback? onMoveUp;
  final VoidCallback? onMoveDown;
  final Function(int, int) onReorder;

  const _PageDraggableListItem({
    Key? key,
    required this.index,
    required this.pageNumber,
    required this.displayOrder,
    required this.thumbnail,
    required this.onDelete,
    required this.onReorder,
    this.onMoveUp,
    this.onMoveDown,
  }) : super(key: key);

  @override
  State<_PageDraggableListItem> createState() => _PageDraggableListItemState();
}

class _PageDraggableListItemState extends State<_PageDraggableListItem>
    with SingleTickerProviderStateMixin {
  bool _isDragging = false;
  late AnimationController _dragAnimController;

  @override
  void initState() {
    super.initState();
    _dragAnimController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _dragAnimController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Draggable<int>(
      data: widget.index,
      feedback: ScaleTransition(
        scale: Tween<double>(begin: 1.0, end: 1.05).animate(_dragAnimController),
        child: _buildListItem(isDragging: true),
      ),
      onDragStarted: () {
        setState(() => _isDragging = true);
        _dragAnimController.forward();
      },
      onDraggableCanceled: (_, __) {
        setState(() => _isDragging = false);
        _dragAnimController.reverse();
      },
      childWhenDragging: Opacity(
        opacity: 0.5,
        child: _buildListItem(isDragging: false),
      ),
      onDragCompleted: () {
        setState(() => _isDragging = false);
        _dragAnimController.reverse();
      },
      child: DragTarget<int>(
        onAccept: (receivedIndex) {
          widget.onReorder(receivedIndex, widget.index);
        },
        onWillAccept: (receivedIndex) {
          return receivedIndex != widget.index;
        },
        builder: (context, candidateData, rejectedData) {
          return _buildListItem(
            isDragging: false,
            isDragTarget: candidateData.isNotEmpty,
          );
        },
      ),
    );
  }

  Widget _buildListItem({
    required bool isDragging,
    bool isDragTarget = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDragTarget
              ? Colors.blue.withValues(alpha: 0.8)
              : Colors.white.withValues(alpha: 0.1),
          width: isDragTarget ? 2 : 1,
        ),
        boxShadow: isDragging || isDragTarget
            ? [
                BoxShadow(
                  color: Colors.blue.withValues(alpha: 0.5),
                  blurRadius: 12,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      child: Row(
        children: [
          // Drag Handle
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.blue.withValues(alpha: 0.8),
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Icon(
              Icons.drag_handle,
              color: Colors.white,
              size: 16,
            ),
          ),
          const SizedBox(width: 12),

          // Thumbnail
          Container(
            width: 60,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: widget.thumbnail != null
                  ? Image.memory(widget.thumbnail, fit: BoxFit.cover)
                  : Icon(
                      Icons.image_not_supported,
                      color: AppColors.textTertiary.withValues(alpha: 0.5),
                    ),
            ),
          ),
          const SizedBox(width: 12),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Page ${widget.displayOrder}',
                  style: AppTextStyles.body.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                Text(
                  'Slide ${widget.pageNumber}',
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.textTertiary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),

          // Actions
          Row(
            children: [
              if (widget.onMoveUp != null)
                IconButton(
                  icon: const Icon(Icons.arrow_upward),
                  onPressed: widget.onMoveUp,
                  iconSize: 18,
                  splashRadius: 20,
                  padding: const EdgeInsets.all(4),
                  constraints: const BoxConstraints(),
                ),
              if (widget.onMoveDown != null)
                IconButton(
                  icon: const Icon(Icons.arrow_downward),
                  onPressed: widget.onMoveDown,
                  iconSize: 18,
                  splashRadius: 20,
                  padding: const EdgeInsets.all(4),
                  constraints: const BoxConstraints(),
                ),
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Colors.red),
                onPressed: widget.onDelete,
                iconSize: 18,
                splashRadius: 20,
                padding: const EdgeInsets.all(4),
                constraints: const BoxConstraints(),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
