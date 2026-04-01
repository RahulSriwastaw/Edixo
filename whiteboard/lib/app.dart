
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'router/app_router.dart';

class EduBoardApp extends ConsumerWidget {
  const EduBoardApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'EduBoard Pro',
      theme: ThemeData.dark(), // Placeholder theme
      routerConfig: router,
    );
  }
}
