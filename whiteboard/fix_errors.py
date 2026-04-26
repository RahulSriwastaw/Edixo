import os, re, glob

base = r'd:\RahulProjects\New EduHub\whiteboard'

# 1. Fix app_colors.dart - change getters to const fields
path = os.path.join(base, 'lib', 'core', 'constants', 'app_colors.dart')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
for name in ['bgPrimary', 'bgSecondary', 'bgPanel', 'bgCard', 'textPrimary', 'textSecondary', 'textTertiary', 'textDisabled', 'toolActive', 'toolHover', 'border']:
    content = content.replace(f'static Color get {name}', f'static const Color {name}')
content = content.replace('=> const Color', '= const Color')
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed app_colors.dart')

# 2. Fix UI files - replace dim. with AppThemeDimensions.
files = [
    'lib/features/auth/presentation/screens/login_screen.dart',
    'lib/features/whiteboard/presentation/widgets/toolbar/top_toolbar.dart',
    'lib/features/whiteboard/presentation/widgets/overlays/slide_panel_drawer.dart',
    'lib/features/whiteboard/presentation/widgets/ai/ai_assistant_panel.dart',
    'lib/features/whiteboard/presentation/widgets/toolbar/floating_style_panel.dart',
    'lib/features/whiteboard/presentation/widgets/toolbar/movable_bottom_toolbar.dart',
    'lib/features/whiteboard/presentation/widgets/toolbar/bottom_main_toolbar.dart',
]
for f in files:
    path = os.path.join(base, f)
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    orig = content
    # Remove 'final dim = AppThemeDimensions;' lines
    content = re.sub(r'final\s+dim\s*=\s*AppThemeDimensions\s*;\n?', '', content)
    content = re.sub(r'\bdim\b\.([a-zA-Z_]+)', r'AppThemeDimensions.\1', content)
    if content != orig:
        with open(path, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f'Fixed {f}')
    else:
        print(f'No change: {f}')

# 3. Fix const expression errors in subject tools
files3 = [
    'lib/features/whiteboard/presentation/widgets/teaching_tools/class_timer.dart',
    'lib/features/whiteboard/presentation/widgets/subject_tools/ruler_widget.dart',
    'lib/features/whiteboard/presentation/widgets/subject_tools/protractor_widget.dart',
    'lib/features/whiteboard/presentation/widgets/subject_tools/compass_widget.dart',
]
for f in files3:
    path = os.path.join(base, f)
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    orig = content
    content = content.replace('const Icon(Icons.close, size: 18,\n                color: AppColors.textPrimary)', 'Icon(Icons.close, size: 18,\n                color: AppColors.textPrimary)')
    content = content.replace('const TextStyle(\n            color: AppColors.textPrimary,', 'TextStyle(\n            color: AppColors.textPrimary,')
    content = content.replace('const TextStyle(\n          color: AppColors.textSecondary,', 'TextStyle(\n          color: AppColors.textSecondary,')
    content = content.replace('const TextStyle(\n              color: AppColors.textPrimary,', 'TextStyle(\n              color: AppColors.textPrimary,')
    content = content.replace('const TextSpan(\n          text:', 'TextSpan(\n          text:')
    if content != orig:
        with open(path, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f'Fixed const: {f}')
    else:
        print(f'No const change: {f}')

print('Done!')
