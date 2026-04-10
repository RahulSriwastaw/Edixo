import 'dart:typed_data';

import 'download_pdf_stub.dart'
    if (dart.library.html) 'download_pdf_web.dart';

Future<void> downloadPdfLocally(Uint8List bytes, String fileName) async {
  await downloadPdf(bytes, fileName);
}
