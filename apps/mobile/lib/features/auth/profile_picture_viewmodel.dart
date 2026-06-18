import 'package:image_picker/image_picker.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'profile_picture_viewmodel.g.dart';

class ProfilePictureState {
  const ProfilePictureState({this.pickedFile, this.isUploading = false});
  final XFile? pickedFile;
  final bool isUploading;

  ProfilePictureState copyWith({XFile? pickedFile, bool? isUploading}) {
    return ProfilePictureState(
      pickedFile: pickedFile ?? this.pickedFile,
      isUploading: isUploading ?? this.isUploading,
    );
  }
}

@riverpod
class ProfilePictureViewModel extends _$ProfilePictureViewModel {
  @override
  ProfilePictureState build() => const ProfilePictureState();

  Future<void> pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final file = await picker.pickImage(source: source, imageQuality: 85);
    if (file != null) {
      state = state.copyWith(pickedFile: file);
    }
  }

  // PLACEHOLDER — replace with UserRepository.requestProfileImageUpload() once
  // the S3 presigned-upload flow is wired into the mobile layer.
  Future<bool> upload() async {
    if (state.pickedFile == null) return false;
    state = state.copyWith(isUploading: true);
    await Future<void>.delayed(const Duration(milliseconds: 800));
    state = state.copyWith(isUploading: false);
    return true;
  }
}
