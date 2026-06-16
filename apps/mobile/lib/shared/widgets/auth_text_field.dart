import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_dimensions.dart';
import '../constants/app_colors.dart';
import '../constants/app_text_styles.dart';

class AuthTextField extends StatelessWidget {
  const AuthTextField({
    super.key,
    required this.controller,
    required this.hint,
    this.keyboardType = TextInputType.text,
    this.obscureText = false,
    this.suffix,
    this.prefix,
    this.onSuffixTap,
    this.autofocus = false,
    this.onChanged,
    this.inputFormatters,
  });

  final TextEditingController controller;
  final String hint;
  final TextInputType keyboardType;
  final bool obscureText;
  final Widget? suffix;
  final Widget? prefix;
  final VoidCallback? onSuffixTap;
  final bool autofocus;
  final ValueChanged<String>? onChanged;
  final List<TextInputFormatter>? inputFormatters;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            if (prefix != null) ...[prefix!, const SizedBox(width: AppDimensions.spacingSm)],
            Expanded(
              child: TextField(
                controller: controller,
                keyboardType: keyboardType,
                obscureText: obscureText,
                autofocus: autofocus,
                onChanged: onChanged,
                inputFormatters: inputFormatters,
                style: AppTextStyles.inputText,
                decoration: InputDecoration(
                  hintText: hint,
                  hintStyle: AppTextStyles.inputHint,
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: EdgeInsets.zero,
                ),
                cursorColor: AppColors.primary,
              ),
            ),
            if (suffix != null)
              Semantics(
                button: true,
                child: GestureDetector(onTap: onSuffixTap, child: suffix!),
              ),
          ],
        ),
        const Divider(color: AppColors.textMuted, thickness: 1, height: 1),
      ],
    );
  }
}
