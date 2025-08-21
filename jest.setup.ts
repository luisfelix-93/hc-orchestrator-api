// Mocks para silenciar o console durante os testes

beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    // Restaura os mocks para não afetar outros testes se houver
    jest.restoreAllMocks();
});
