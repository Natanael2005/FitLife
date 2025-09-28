export class UnauthorizedAccess extends Error {
  constructor(message: string = 'Unauthorized access to routine') {
    super(message);
    this.name = 'UnauthorizedAccess';
  }
}