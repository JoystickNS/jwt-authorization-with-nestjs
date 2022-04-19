export const ExceptionMessages = {
  Forbidden: "Недостаточно прав",
  Unauthorized: "Пользователь не авторизован",
  IncorrectLoginOrPass: "Неверный логин или пароль",
  LoginAlreadyUsed: (login: string) =>
    `Пользователь с логином ${login} уже существует`,
};
