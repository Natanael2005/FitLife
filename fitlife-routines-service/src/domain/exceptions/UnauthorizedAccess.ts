export class UnauthorizedAccess extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedAccess';
  }
}
