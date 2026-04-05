
class TeacherModel {
  final String id;
  final String name;
  final String email;
  final String username;
  final String role;       // 'teacher'

  const TeacherModel({
    required this.id,
    required this.name,
    required this.email,
    required this.username,
    required this.role,
  });

  factory TeacherModel.fromJson(Map<String, dynamic> json) => TeacherModel(
    id:      (json['userId'] ?? json['id'] ?? '') as String,
    name:    (json['name'] ?? 'Teacher') as String,
    email:   (json['email'] ?? '') as String,
    username: (json['username'] ?? json['loginId'] ?? '') as String,
    role:    (json['role'] ?? json['staffRole'] ?? 'teacher') as String,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'username': username,
    'role': role,
  };
}
