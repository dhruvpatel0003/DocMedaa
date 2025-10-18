import 'package:flutter/material.dart';

const _kPrimary = Color(0xFF0B30B2);
const _kRadius = 15.0;
const _kBreakpoint = 600.0;

/// Common layout used by all screens.
/// phones: AppBar + Drawer; wide: rail + info panel + header.
class AppShell extends StatelessWidget {
  final String title;
  final bool showBack;
  final List<Widget> actions;
  final Widget child;

  const AppShell({
    super.key,
    required this.title,
    this.showBack = false,
    this.actions = const [],
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, c) {
        final isNarrow = c.maxWidth < _kBreakpoint;

        if (isNarrow) {
          // ---- phones ----
          return Scaffold(
            appBar: AppBar(
              backgroundColor: _kPrimary,
              centerTitle: true,
              elevation: 0,
              leading: IconButton(
                icon: Icon(
                  showBack ? Icons.arrow_back_ios_new : Icons.menu,
                  color: Colors.white,
                ),
                onPressed: showBack
                    ? () => Navigator.maybePop(context)
                    : () => Scaffold.of(context).openDrawer(),
              ),
              title: const Text(
                'DocMedaa',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
              actions: const [
                Padding(
                  padding: EdgeInsets.only(right: 12),
                  child: _AvatarMenu(), // popup menu (Profile/SignOut)
                ),
              ],
            ),
            drawer: const _SideDrawer(),
            body: Padding(
              padding: const EdgeInsets.all(12),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(_kRadius),
                child: Material(color: Colors.white, child: child),
              ),
            ),
          );
        }

        // ---- tablets/desktop ----
        return Row(
          children: [
            // NAV RAIL
            Container(
              width: 90,
              color: const Color(0xFFF1F1F1),
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Column(
                children: [
                  const SizedBox(height: 8),
                  const Text(
                    'DocMedaa',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: _kPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView(
                      children: const [
                        _RailItem(
                          Icons.home_outlined,
                          'Home',
                          '/patient_dashboard',
                        ),
                        _RailItem(
                          Icons.notifications_outlined,
                          'Notifications',
                          '/patient_notification',
                        ),
                        _RailItem(
                          Icons.person_outline,
                          'Profile',
                          '/patient_profile',
                        ),
                        _RailItem(Icons.help_outline, 'Help', null),
                      ],
                    ),
                  ),
                  const Divider(),
                  TextButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.logout, size: 16),
                    label: const Text('Logout'),
                  ),
                ],
              ),
            ),

            // INFO PANEL
            Container(
              width: 180,
              color: const Color(0xFFF9F9F9),
              padding: const EdgeInsets.all(16),
              child: const _InfoPanel(),
            ),

            // CONTENT
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(_kRadius),
                  child: Material(
                    color: Colors.white,
                    child: Column(
                      children: [
                        Container(
                          height: 56,
                          decoration: const BoxDecoration(
                            border: Border(
                              bottom: BorderSide(color: Color(0xFFECECEC)),
                            ),
                          ),
                          child: Row(
                            children: [
                              if (showBack)
                                IconButton(
                                  icon: const Icon(
                                    Icons.arrow_back_ios_new,
                                    size: 18,
                                  ),
                                  onPressed: () => Navigator.maybePop(context),
                                )
                              else
                                const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  title,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              ...actions,
                              const SizedBox(width: 4),
                              const _AvatarMenu(), // popup on wide too
                              const SizedBox(width: 12),
                            ],
                          ),
                        ),
                        Expanded(child: child),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

/// Drawer for phones (same panel content)
class _SideDrawer extends StatelessWidget {
  const _SideDrawer();

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(12),
          children: const [_InfoPanel()],
        ),
      ),
    );
  }
}

/// Left info panel (no paragraph as requested)
class _InfoPanel extends StatelessWidget {
  const _InfoPanel();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: const [
        _LeftItem(Icons.notifications_outlined, 'Notification'),
        _LeftItem(Icons.show_chart_outlined, 'My Tracker'),
        _LeftItem(Icons.info_outline, 'About Us'),
      ],
    );
  }
}

class _LeftItem extends StatelessWidget {
  final IconData icon;
  final String text;
  const _LeftItem(this.icon, this.text);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 6),
    child: Row(
      children: [
        Icon(icon, size: 16),
        const SizedBox(width: 8),
        Flexible(
          child: Text(
            text,
            style: const TextStyle(fontSize: 16, color: Colors.black87),
          ),
        ),
      ],
    ),
  );
}

class _RailItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? route;
  const _RailItem(this.icon, this.label, this.route);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: route == null ? null : () => Navigator.pushNamed(context, route!),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Column(
          children: [
            Icon(icon, size: 22, color: Colors.black87),
            const SizedBox(height: 6),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }
}

/// Avatar → Profile/SignOut popup (rounded like Figma)
class _AvatarMenu extends StatelessWidget {
  const _AvatarMenu();

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      tooltip: 'Profile menu',
      offset: const Offset(0, 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
        side: const BorderSide(color: Color(0xFFECECEC)),
      ),
      color: Colors.white,
      onSelected: (v) {
        if (v == 'profile') {
          Navigator.pushNamed(context, '/patient_profile');
        } else if (v == 'signout') {
          // plug your auth sign-out here
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(const SnackBar(content: Text('Signed out')));
        }
      },
      itemBuilder: (context) => const [
        PopupMenuItem<String>(
          value: 'profile',
          height: 40,
          child: Center(
            child: Text(
              'Profile',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ),
        ),
        PopupMenuDivider(height: 1),
        PopupMenuItem<String>(
          value: 'signout',
          height: 40,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.logout, size: 16),
              SizedBox(width: 6),
              Text('SignOut', style: TextStyle(fontSize: 16)),
            ],
          ),
        ),
      ],
      child: const CircleAvatar(radius: 14, backgroundColor: Color(0xFFE0E0E0)),
    );
  }
}
