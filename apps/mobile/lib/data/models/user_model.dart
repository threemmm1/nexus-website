class UserModel {
  const UserModel({
    required this.id,
    required this.username,
    required this.email,
    this.phone,
    this.avatarUrl,
    this.bannerUrl,
    this.bio,
    this.followersCount = 0,
    this.followingCount = 0,
  });

  final String id;
  final String username;
  final String email;
  final String? phone;
  final String? avatarUrl;
  final String? bannerUrl;
  final String? bio;
  final int followersCount;
  final int followingCount;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      bannerUrl: json['bannerUrl'] as String?,
      bio: json['bio'] as String?,
      followersCount: json['followersCount'] as int? ?? 0,
      followingCount: json['followingCount'] as int? ?? 0,
    );
  }
}
