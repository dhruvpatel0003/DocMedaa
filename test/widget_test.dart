import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:docmedaa_frontend/main.dart'; // <-- make sure this matches your pubspec name

void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());

    // initial state
    expect(find.text('0'), findsOneWidget);
    expect(find.text('1'), findsNothing);

    // tap the FAB by key (unique)
    await tester.tap(find.byKey(const Key('fab_increment')));
    await tester.pump();

    // updated state
    expect(find.text('1'), findsOneWidget);
  });
}
