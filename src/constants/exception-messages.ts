export const ExceptionMessages = {
  Unauthorized: "Пользователь не авторизован",
  IncorrectLoginOrPass: "Неверный логин или пароль",
  LoginAlreadyUsed: (login: string) =>
    `Пользователь с логином ${login} уже существует`,
};
