#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/6ebb20d15d2634562f394d9083344c5772c7103aaf5863e3569b57dbf565e2d6/contract';
import startContract from '../../snapshots/6ebb20d15d2634562f394d9083344c5772c7103aaf5863e3569b57dbf565e2d6/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/7c9c80cdf38622854194a98b05e73c198174fe68f0492cedf189f4bb7cfc21cc/contract';
import endContract from '../../snapshots/7c9c80cdf38622854194a98b05e73c198174fe68f0492cedf189f4bb7cfc21cc/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'product',
        column: col('materials', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'product',
        column: col('shipping', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'product',
        column: col('returns', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

