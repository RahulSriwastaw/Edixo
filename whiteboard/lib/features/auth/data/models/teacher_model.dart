
class TeacherModel {
  final String id;
  final String name;
  final String email;
  final String orgId;
  final String orgName;
  final String role;       // 'teacher'

  const TeacherModel({
    required this.id,
    required this.name,
    required this.email,
    required this.orgId,
    required this.orgName,
    required this.role,
  });

  factory TeacherModel.fromJson(Map<String, dynamic> json) => TeacherModel(
    id:      (json['userId'] ?? json['id'] ?? '') as String,
    name:    (json['name'] ?? 'Teacher') as String,
    email:   (json['email'] ?? '') as String,
    orgId:   (json['orgId'] ?? '') as String,
    orgName: json['orgName'] as String? ?? '',
    role:    (json['role'] ?? json['staffRole'] ?? 'teacher') as String,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'orgId': orgId,
    'orgName': orgName,
    'role': role,
  };
}
