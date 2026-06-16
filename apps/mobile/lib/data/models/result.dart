// Repositories never throw — they return Result so callers must handle both branches.
sealed class Result<T, E> {
  const Result();
}

class Success<T, E> extends Result<T, E> {
  const Success(this.data);
  final T data;
}

class Failure<T, E> extends Result<T, E> {
  const Failure(this.error);
  final E error;
}
