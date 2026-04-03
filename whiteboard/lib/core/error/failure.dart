
// lib/core/error/failure.dart
// Uses result_dart package for Result<T, Failure>

sealed class Failure {
  final String message;
  const Failure(this.message);
}

class NetworkFailure       extends Failure { const NetworkFailure(super.message); }
class ServerFailure        extends Failure { const ServerFailure(super.message); }
class UnauthorizedFailure  extends Failure { const UnauthorizedFailure(super.message); }
class NotFoundFailure      extends Failure { const NotFoundFailure(super.message); }
class WrongPasswordFailure extends Failure { const WrongPasswordFailure(super.message); }
class LocalStorageFailure  extends Failure { const LocalStorageFailure(super.message); }
