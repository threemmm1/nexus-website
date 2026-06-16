import 'package:flutter/material.dart';
import '../constants/app_dimensions.dart';
import '../constants/app_text_styles.dart';

class MarqueeTagRow extends StatefulWidget {
  const MarqueeTagRow({
    super.key,
    required this.tags,
    required this.activeTag,
    this.reverse = false,
    this.speed = 30.0,
  });

  final List<String> tags;
  final String activeTag;
  final bool reverse;
  final double speed;

  @override
  State<MarqueeTagRow> createState() => _MarqueeTagRowState();
}

class _MarqueeTagRowState extends State<MarqueeTagRow>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<Offset> _offset;

  @override
  void initState() {
    super.initState();
    final totalWidth = widget.tags.length * AppDimensions.marqueeTagWidth;
    final durationMs = (totalWidth / widget.speed * 1000).round();

    _controller = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: durationMs),
    )..repeat();

    _offset = Tween<Offset>(
      begin: widget.reverse ? const Offset(1, 0) : Offset.zero,
      end: widget.reverse ? Offset.zero : const Offset(-1, 0),
    ).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final doubled = [...widget.tags, ...widget.tags];
    return ClipRect(
      child: SlideTransition(
        position: _offset,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: doubled.map((tag) {
            final isActive = tag == widget.activeTag;
            return Padding(
              padding: const EdgeInsets.only(right: AppDimensions.marqueeTagSpacing),
              child: Text(
                tag,
                style: isActive ? AppTextStyles.marqueeActive : AppTextStyles.marqueeInactive,
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
