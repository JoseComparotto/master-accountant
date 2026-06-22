import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/shared/presentation/filters/domain-exception.filter';
import { DatabaseSeeder } from '../src/shared/infrastructure/db/seeders/DatabaseSeeder';
import { MikroORM } from '@mikro-orm/core';
import type { SqliteDriver } from '@mikro-orm/sqlite';

const accountSeeds = [
  {
    key: 'ativo_raiz',
    name: 'Ativo',
    description: 'Bens e direitos da entidade.',
    formattedCode: '1',
    isSummary: true,
    getParentId: () => null, // Raiz
  },
  {
    key: 'ativo_circulante',
    name: 'Ativo Circulante',
    description: 'Disponibilidades e direitos realizáveis no curto prazo.',
    formattedCode: '1.1',
    isSummary: true,
    getParentId: (ids: Record<string, string>) => ids['ativo_raiz'],
  },
  {
    key: 'caixa',
    name: 'Caixa e Equivalentes de Caixa',
    description: 'Moeda em poder da entidade e depósitos bancários imediatos.',
    formattedCode: '1.1.1',
    isSummary: false, // Analítica
    getParentId: (ids: Record<string, string>) => ids['ativo_circulante'],
  },
];

describe('Contas Contábeis - /coa/accounts (e2e - Caminho Feliz)', () => {
  let app: INestApplication;
  let orm: MikroORM<SqliteDriver>;

  const createdIds: Record<string, string> = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter());

    await app.init();

    orm = app.get<MikroORM<SqliteDriver>>(MikroORM);

    await orm.schema.ensureDatabase();
    await orm.schema.drop();
    await orm.schema.create();

    await orm.seeder.seed(DatabaseSeeder);
  });

  afterAll(async () => {
    await app.close();
  });

  // ==========================================================================
  // EXECUÇÃO DO PROVISIONAMENTO (CAMINHO FELIZ)
  // ==========================================================================
  describe('Provisionamento Inicial (Caminho Feliz)', () => {
    for (const seed of accountSeeds) {
      const tipoConta = seed.isSummary ? 'Sintética' : 'Analítica';

      it(`POST /coa/accounts/ -> Deve criar a conta "${seed.name}" (${tipoConta})`, async () => {
        const parentId = seed.getParentId(createdIds);

        const payload = {
          name: seed.name,
          description: seed.description,
          parentId: parentId,
          accountClass: 'asset',
          isSummary: seed.isSummary,
          isContra: false,
          isActive: true
        };

        const response = await request(app.getHttpServer())
          .post('/coa/accounts/')
          .send(payload)
          .expect(201);

        expect(response.body.id).toBeDefined();
        expect(response.body.formattedCode).toBe(seed.formattedCode);
        expect(response.body.name).toBe(payload.name);
        expect(response.body.isSummary).toBe(payload.isSummary);
        expect(response.body.parentId).toBe(payload.parentId);

        createdIds[seed.key] = response.body.id;
      });
    }
  });

  // ==========================================================================
  // VALIDAÇÃO DE INVARIANTES DE DOMÍNIO (REGRAS DE NEGÓCIO)
  // ==========================================================================
  describe('Invariantes de Domínio - Restrições de Raiz', () => {
    it('POST /coa/accounts/ -> Deve rejeitar com 422 a criação de uma segunda conta raiz com a mesma classe (asset)', async () => {
      const segundaRaizInvalida = {
        name: 'Outro Ativo Independente',
        description: 'Tentativa ilegal de duplicar a raiz da classe asset na árvore.',
        parentId: null, // Força tentativa de criar como raiz
        accountClass: 'asset', // Mesma classe que o 'Ativo' criado no loop acima
        isSummary: true,
        isContra: false,
        isActive: true
      };

      const response = await request(app.getHttpServer())
        .post('/coa/accounts/')
        .send(segundaRaizInvalida)
        .expect(422);

      expect(response.body.statusCode).toBe(422);
      expect(response.body.message).toBeDefined();
      expect(response.body.path).toBeDefined();
    });
  });
});