import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';
import '../constants/app_dimensions.dart';
import '../constants/app_text_styles.dart';

class OtpField extends StatefulWidget {
  const OtpField({super.key, required this.length, required this.onCompleted});

  final int length;
  final ValueChanged<String> onCompleted;

  @override
  State<OtpField> createState() => _OtpFieldState();
}

class _OtpFieldState extends State<OtpField> {
  late final List<TextEditingController> _controllers;
  late final List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(widget.length, (_) => TextEditingController());
    _focusNodes = List.generate(widget.length, (_) => FocusNode());
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  void _onChanged(String value, int index) {
    if (value.length == 1 && index < widget.length - 1) {
      _focusNodes[index + 1].requestFocus();
    }
    if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
    final otp = _controllers.map((c) => c.text).join();
    if (otp.length == widget.length) widget.onCompleted(otp);
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(widget.length, (i) {
        return Padding(
          padding: EdgeInsets.only(
            right: i < widget.length - 1 ? AppDimensions.otpFieldSpacing : 0,
          ),
          child: SizedBox(
            width: AppDimensions.otpFieldSize,
            child: TextField(
              controller: _controllers[i],
              focusNode: _focusNodes[i],
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              maxLength: 1,
              autofocus: i == 0,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              style: AppTextStyles.inputText,
              decoration: const InputDecoration(
                counterText: '',
                enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: AppColors.textMuted),
                ),
                focusedBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: AppColors.primary),
                ),
                isDense: true,
                contentPadding: EdgeInsets.only(bottom: 4),
              ),
              cursorColor: AppColors.primary,
              onChanged: (v) => _onChanged(v, i),
            ),
          ),
        );
      }),
    );
  }
}
