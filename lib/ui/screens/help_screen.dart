import 'package:flutter/material.dart';
import '../theme.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Row(
        children: [
          // LEFT PANEL
          Container(
            width: 220,
            color: const Color(0xFFF6F6F6),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Logo
                Row(
                  children: const [
                    Icon(Icons.add_circle, color: Colors.redAccent, size: 28),
                    SizedBox(width: 6),
                    Text(
                      "DocMedaa",
                      style: TextStyle(
                        color: Color(0xFF0033CC),
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // Menu Items
                const _SideMenuItem(icon: Icons.notifications_outlined, label: "Notification"),
                const SizedBox(height: 16),
                const _SideMenuItem(icon: Icons.favorite_border, label: "My Tracker"),
                const SizedBox(height: 16),
                const _SideMenuItem(icon: Icons.info_outline, label: "About Us"),

                const SizedBox(height: 40),
                const Text(
                  "This side panel has 5 tabs view doctor-dashboard for more info",
                  style: TextStyle(fontSize: 12, color: Colors.black54),
                ),

                const Spacer(),
                // Close button
                Row(
                  children: const [
                    Icon(Icons.close, size: 16, color: Colors.black54),
                    SizedBox(width: 6),
                    Text("Close", style: TextStyle(color: Colors.black54)),
                  ],
                ),
              ],
            ),
          ),

          // RIGHT PANEL
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Stack(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top bar
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: const [
                              Icon(Icons.arrow_back_ios_new, size: 16, color: Colors.black54),
                              SizedBox(width: 4),
                              Text("Back", style: TextStyle(color: Colors.black54)),
                            ],
                          ),
                          Row(
                            children: const [
                              Icon(Icons.call_outlined, size: 16, color: Colors.black54),
                              SizedBox(width: 4),
                              Text("Call", style: TextStyle(color: Colors.black54)),
                            ],
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),
                      const Text(
                        "Here are the general issues and solutions",
                        style: TextStyle(fontSize: 14, color: Colors.black54),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        "1. Login / SignUp Issues",
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        "1.1 Login / SignUp issue",
                        style: TextStyle(fontSize: 14, color: Colors.black87),
                      ),
                      const SizedBox(height: 16),

                      // Gray placeholder box
                      Container(
                        height: 120,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      const SizedBox(height: 16),

                      const Text(
                        "Troubleshooting:",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        "1. Clear the cache from the mobile data.\n   settings > mobile cache ...",
                        style: TextStyle(fontSize: 14),
                      ),
                    ],
                  ),

                  // Bottom-right headphone icon
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      height: 45,
                      width: 45,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.headphones, color: Colors.black87),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// A small reusable widget for sidebar menu items
class _SideMenuItem extends StatelessWidget {
  final IconData icon;
  final String label;

  const _SideMenuItem({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: Colors.black87, size: 20),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(fontSize: 14, color: Colors.black87)),
      ],
    );
  }
}
