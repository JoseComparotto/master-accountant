import { ChartOfAccounts } from './chart-of-accounts.entity';

describe('ChartOfAccountsEntity', () => {
  
  describe('create()', () => {

    // --- TESTE DA INVARIANTE 1 ---
    it.each([
      ['   '],
      [''],
      [null],
      [undefined],
    ])('deve lançar erro se o nome do Plano de Contas for inválido: %p', (nomeInvalido) => {
      const levelWidths = [1, 1];
      
      expect(() => {
        ChartOfAccounts.create(undefined, nomeInvalido as any, levelWidths);
      }).toThrow('O nome do Plano de Contas não pode estar vazio.');
    });

    // --- TESTE DA INVARIANTE 2 ---
    it.each([
      [ [] ],         // Array vazio
      [ null ],       // Nulo
      [ undefined ]   // Indefinido
    ])('deve lançar erro se a definição de níveis (levelWidths) for inválida: %p', (niveisInvalidos) => {
      const name = 'Plano Corporativo Oficial';
      
      expect(() => {
        ChartOfAccounts.create(undefined, name, niveisInvalidos as any);
      }).toThrow('O Plano de Contas precisa definir a largura de pelo menos um nível.');
    });

    // --- TESTE DA INVARIANTE 3 (Limite do PostgreSQL LTree) ---
    // O array do it.each recebe: [ [Larguras Incomuns], TotalCalculadoEsperado ]
    it.each([
      [ [256], 256 ],                    // 256 + 0 separadores = 256
      [ [120, 120, 14], 256 ],           // 120 + 120 + 14 + 2 separadores = 256
      [ Array(128).fill(2), 383 ],       // 128 níveis de tamanho 2 = 256 + 127 separadores = 383
    ])('deve lançar erro se o limite de 255 caracteres do LTree for excedido (Larguras: %p)', (largurasInvalidas, totalCalculado) => {
      const name = 'Plano Gigante';
      
      expect(() => {
        ChartOfAccounts.create(undefined, name, largurasInvalidas);
      }).toThrow(`A máscara do plano de contas excede o limite máximo permitido para estruturação hierárquica. Máximo: 255 caracteres, Calculado: ${totalCalculado}.`);
    });

    // --- TESTE DA INVARIANTE 4 (Integridade matemática) ---
    // O array do it.each recebe: [ [Larguras com erro], IndiceDoNivelQueVaiFalhar ]
    it.each([
      [ [0], 1 ],             // Nível 1 é zero
      [ [-5], 1 ],            // Nível 1 é negativo
      [ [2, 0, 3], 2 ],       // Nível 2 é zero
      [ [2, 3, 4, -1], 4 ],   // Nível 4 é negativo
    ])('deve lançar erro se a largura de algum nível for menor ou igual a zero (Larguras: %p)', (largurasInvalidas, nivelComErro) => {
      const name = 'Plano com falha matemática';
      
      expect(() => {
        ChartOfAccounts.create(undefined, name, largurasInvalidas);
      }).toThrow(`A largura do nível ${nivelComErro} deve ser maior que zero.`);
    });

    // --- TESTE DO CAMINHO FELIZ (SUCESSO) ---
    it('deve criar uma instância válida do Plano de Contas com todos os parâmetros corretos', () => {
      const name = 'Plano Corporativo Oficial';
      const levelWidths = [1, 2, 3]; // Ex: 1.01.001
      
      const chart = ChartOfAccounts.create(undefined, name, levelWidths);
      
      // Aqui você garante que, quando tudo dá certo, o objeto nasce perfeito
      expect(chart).toBeDefined();
      expect(chart.name).toBe(name);
      expect(chart.levelWidths).toEqual(levelWidths);
    });

  });
});