import 'package:flutter/material.dart';
import '../../widgets/app_shell.dart';

class PatientDashboard extends StatelessWidget {
  const PatientDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppShell(
        title: 'Home',
        child: LayoutBuilder(
          builder: (context, constraints) {
            final gap = constraints.maxWidth < 400 ? 12.0 : 24.0;
            return SingleChildScrollView(
              padding: EdgeInsets.all(gap),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1000),
                  child: _TilesBlock(gap: gap),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _TilesBlock extends StatelessWidget {
  final double gap;
  const _TilesBlock({required this.gap});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (_, c) {
        final double s = c.maxWidth.clamp(280.0, 1000.0) / 7.2;
        final double size = s.clamp(88.0, 120.0);
        final tiles = const [
          _TileData(Icons.event_outlined, 'Appointments', null),
          _TileData(
            Icons.chat_bubble_outline,
            'Chat with Patients',
            '/patient_chat',
          ),
          _TileData(Icons.devices_other_outlined, 'Devices', null),
          _TileData(Icons.menu_book_outlined, 'Resources', null),
          _TileData(Icons.help_outline, 'Help', null),
        ];
        return Wrap(
          spacing: gap,
          runSpacing: gap,
          children: tiles.map((t) => _DashBox(tile: t, side: size)).toList(),
        );
      },
    );
  }
}

class _TileData {
  final IconData icon;
  final String label;
  final String? route;
  const _TileData(this.icon, this.label, this.route);
}

class _DashBox extends StatelessWidget {
  final _TileData tile;
  final double side;
  const _DashBox({required this.tile, required this.side});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(15),
      onTap: tile.route == null
          ? null
          : () => Navigator.pushNamed(context, tile.route!),
      child: Ink(
        width: side,
        height: side,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: const Color(0xFFECECEC)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(tile.icon, size: side * 0.28, color: Colors.black87),
            const SizedBox(height: 8),
            Text(
              tile.label,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}
