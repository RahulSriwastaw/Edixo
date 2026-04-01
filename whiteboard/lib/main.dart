
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  
  // Adapter registration will go here in a future step

  // Opening Hive boxes will go here

  runApp(const ProviderScope(child: EduBoardApp()));
}
