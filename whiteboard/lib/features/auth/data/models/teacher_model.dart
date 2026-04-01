
class TeacherModel {
  final String id;
  final String name;
  final String email;
  final String orgId;

  TeacherModel({required this.id, required this.name, required this.email, required this.orgId});

  factory TeacherModel.fromJson(Map<String, dynamic> json) {
    return TeacherModel(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      orgId: json['orgId'],
    );
  }
}
