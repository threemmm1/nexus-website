import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../shared/constants/app_constants.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/navigation/app_routes.dart';
import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_text_styles.dart';
import '../../shared/widgets/auth_header.dart';
import '../../shared/widgets/vesioh_button.dart';
import 'birthday_viewmodel.dart';

class BirthdayScreen extends ConsumerWidget {
  const BirthdayScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selection = ref.watch(birthdayViewModelProvider);
    final viewModel = ref.watch(birthdayViewModelProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.spacingLg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AuthHeader(
                title: "When's your birthday?",
                subtitle: "Your birthday won't be shown publicly.",
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppDimensions.spacingXxxl),
              Text(
                viewModel.displayDate,
                style: viewModel.hasSelection ? AppTextStyles.displayTitle : AppTextStyles.inputHint,
              ),
              const Divider(color: AppColors.textMuted, thickness: 1, height: AppDimensions.spacingXxl),
              const Spacer(),
              _DatePicker(
                day: selection.day,
                month: selection.month,
                year: selection.year,
                onChanged: (d, m, y) => viewModel.setDate(day: d, month: m, year: y),
              ),
              const SizedBox(height: AppDimensions.spacingXxl),
              VesiohButton(
                label: 'Continue',
                onPressed: viewModel.hasSelection && viewModel.meetsAgeRequirement
                    ? () => context.push(AppRoutes.verifyCode)
                    : null,
              ),
              const SizedBox(height: AppDimensions.spacingXxl),
            ],
          ),
        ),
      ),
    );
  }
}

class _DatePicker extends StatelessWidget {
  const _DatePicker({
    required this.day,
    required this.month,
    required this.year,
    required this.onChanged,
  });

  final int day;
  final int month;
  final int year;
  final void Function(int day, int month, int year) onChanged;

  @override
  Widget build(BuildContext context) {
    final currentYear = DateTime.now().year;
    return SizedBox(
      height: AppDimensions.datePickerHeight,
      child: Row(
        children: [
          Expanded(
            child: _Wheel(
              items: List.generate(31, (i) => (i + 1).toString().padLeft(2, '0')),
              initialIndex: day - 1,
              onSelected: (i) => onChanged(i + 1, month, year),
            ),
          ),
          Expanded(
            child: _Wheel(
              items: List.generate(12, (i) => (i + 1).toString().padLeft(2, '0')),
              initialIndex: month - 1,
              onSelected: (i) => onChanged(day, i + 1, year),
            ),
          ),
          Expanded(
            flex: 2,
            child: _Wheel(
              items: List.generate(100, (i) => (currentYear - i).toString()),
              initialIndex: AppConstants.minimumAgeYears,
              onSelected: (i) => onChanged(day, month, currentYear - i),
            ),
          ),
        ],
      ),
    );
  }
}

class _Wheel extends StatefulWidget {
  const _Wheel({
    required this.items,
    required this.initialIndex,
    required this.onSelected,
  });

  final List<String> items;
  final int initialIndex;
  final ValueChanged<int> onSelected;

  @override
  State<_Wheel> createState() => _WheelState();
}

class _WheelState extends State<_Wheel> {
  late final FixedExtentScrollController _controller;

  @override
  void initState() {
    super.initState();
    _controller = FixedExtentScrollController(initialItem: widget.initialIndex);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListWheelScrollView.useDelegate(
      controller: _controller,
      itemExtent: AppDimensions.datePickerItemExtent,
      physics: const FixedExtentScrollPhysics(),
      onSelectedItemChanged: widget.onSelected,
      childDelegate: ListWheelChildBuilderDelegate(
        childCount: widget.items.length,
        builder: (context, index) => Center(
          child: Text(
            widget.items[index],
            style: AppTextStyles.pickerItem,
          ),
        ),
      ),
    );
  }
}
