class SessionUser {
  const SessionUser({
    required this.id,
    required this.email,
    required this.role,
    required this.accountStatus,
    required this.isEmailVerified,
    this.name,
    this.avatar,
    this.walletAddress,
    this.status,
  });

  final int id;
  final String email;
  final String role;
  final String accountStatus;
  final bool isEmailVerified;
  final String? name;
  final String? avatar;
  final String? walletAddress;
  final String? status;

  factory SessionUser.fromJson(Map<String, dynamic> json) {
    return SessionUser(
      id: (json['id'] as num?)?.toInt() ?? 0,
      email: (json['email'] ?? '').toString(),
      role: (json['role'] ?? 'client').toString(),
      accountStatus: (json['accountStatus'] ?? 'UNKNOWN').toString(),
      isEmailVerified: json['isEmailVerified'] == true,
      name: json['name']?.toString(),
      avatar: json['avatar']?.toString(),
      walletAddress: json['walletAddress']?.toString(),
      status: json['status']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'role': role,
      'accountStatus': accountStatus,
      'isEmailVerified': isEmailVerified,
      'name': name,
      'avatar': avatar,
      'walletAddress': walletAddress,
      'status': status,
    };
  }
}

class AuthTokens {
  const AuthTokens({required this.accessToken, this.refreshToken});

  final String accessToken;
  final String? refreshToken;

  Map<String, dynamic> toJson() {
    return {'accessToken': accessToken, 'refreshToken': refreshToken};
  }

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      accessToken: (json['accessToken'] ?? '').toString(),
      refreshToken: json['refreshToken']?.toString(),
    );
  }
}

class RegisterResult {
  const RegisterResult({
    required this.requireVerification,
    required this.email,
    this.message,
  });

  final bool requireVerification;
  final String email;
  final String? message;
}
