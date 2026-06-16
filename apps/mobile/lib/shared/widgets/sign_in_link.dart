import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import '../constants/app_text_styles.dart';

class SignInLink extends StatefulWidget {
  const SignInLink({super.key, required this.onSignIn});

  final VoidCallback onSignIn;

  @override
  State<SignInLink> createState() => _SignInLinkState();
}

class _SignInLinkState extends State<SignInLink> {
  late final TapGestureRecognizer _recognizer;

  @override
  void initState() {
    super.initState();
    _recognizer = TapGestureRecognizer()..onTap = widget.onSignIn;
  }

  @override
  void dispose() {
    _recognizer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Text.rich(
      TextSpan(
        style: AppTextStyles.body,
        children: [
          const TextSpan(text: 'Already have an account? '),
          TextSpan(
            text: 'Sign in',
            style: AppTextStyles.signInEmphasis,
            recognizer: _recognizer,
          ),
        ],
      ),
      textAlign: TextAlign.center,
    );
  }
}
