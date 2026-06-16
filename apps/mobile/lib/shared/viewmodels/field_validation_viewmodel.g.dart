// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'field_validation_viewmodel.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$fieldValidationViewModelHash() =>
    r'43443b2515e180ee69a107431ae44b6277b2e329';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

abstract class _$FieldValidationViewModel
    extends BuildlessAutoDisposeNotifier<String> {
  late final bool Function(String) validator;

  String build(
    bool Function(String) validator,
  );
}

/// See also [FieldValidationViewModel].
@ProviderFor(FieldValidationViewModel)
const fieldValidationViewModelProvider = FieldValidationViewModelFamily();

/// See also [FieldValidationViewModel].
class FieldValidationViewModelFamily extends Family<String> {
  /// See also [FieldValidationViewModel].
  const FieldValidationViewModelFamily();

  /// See also [FieldValidationViewModel].
  FieldValidationViewModelProvider call(
    bool Function(String) validator,
  ) {
    return FieldValidationViewModelProvider(
      validator,
    );
  }

  @override
  FieldValidationViewModelProvider getProviderOverride(
    covariant FieldValidationViewModelProvider provider,
  ) {
    return call(
      provider.validator,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'fieldValidationViewModelProvider';
}

/// See also [FieldValidationViewModel].
class FieldValidationViewModelProvider
    extends AutoDisposeNotifierProviderImpl<FieldValidationViewModel, String> {
  /// See also [FieldValidationViewModel].
  FieldValidationViewModelProvider(
    bool Function(String) validator,
  ) : this._internal(
          () => FieldValidationViewModel()..validator = validator,
          from: fieldValidationViewModelProvider,
          name: r'fieldValidationViewModelProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$fieldValidationViewModelHash,
          dependencies: FieldValidationViewModelFamily._dependencies,
          allTransitiveDependencies:
              FieldValidationViewModelFamily._allTransitiveDependencies,
          validator: validator,
        );

  FieldValidationViewModelProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.validator,
  }) : super.internal();

  final bool Function(String) validator;

  @override
  String runNotifierBuild(
    covariant FieldValidationViewModel notifier,
  ) {
    return notifier.build(
      validator,
    );
  }

  @override
  Override overrideWith(FieldValidationViewModel Function() create) {
    return ProviderOverride(
      origin: this,
      override: FieldValidationViewModelProvider._internal(
        () => create()..validator = validator,
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        validator: validator,
      ),
    );
  }

  @override
  AutoDisposeNotifierProviderElement<FieldValidationViewModel, String>
      createElement() {
    return _FieldValidationViewModelProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is FieldValidationViewModelProvider &&
        other.validator == validator;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, validator.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin FieldValidationViewModelRef on AutoDisposeNotifierProviderRef<String> {
  /// The parameter `validator` of this provider.
  bool Function(String) get validator;
}

class _FieldValidationViewModelProviderElement
    extends AutoDisposeNotifierProviderElement<FieldValidationViewModel, String>
    with FieldValidationViewModelRef {
  _FieldValidationViewModelProviderElement(super.provider);

  @override
  bool Function(String) get validator =>
      (origin as FieldValidationViewModelProvider).validator;
}
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
