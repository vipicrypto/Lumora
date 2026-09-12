#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/6dc411fc5ec002496facc73cf1d60a2ee783bf359444870f83cd8b4738b7562b/contract';
import endContract from '../../snapshots/6dc411fc5ec002496facc73cf1d60a2ee783bf359444870f83cd8b4738b7562b/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/7c9c80cdf38622854194a98b05e73c198174fe68f0492cedf189f4bb7cfc21cc/contract';
import startContract from '../../snapshots/7c9c80cdf38622854194a98b05e73c198174fe68f0492cedf189f4bb7cfc21cc/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'heroSlide',
        column: col('animation', 'text', {
          notNull: true,
          default: lit('fade'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'heroSlide',
        column: col('animationDuration', 'int4', {
          notNull: true,
          default: lit(600),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

