#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0e6ae08711ebc63bc784ab6a4991a384991da82ff19055a3eb3aa40f21bccd79/contract';
import startContract from '../../snapshots/0e6ae08711ebc63bc784ab6a4991a384991da82ff19055a3eb3aa40f21bccd79/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/39424372aac41c6e4b4f9808e85d54ad44d1e9d2d3c214d9398725bed3b509f7/contract';
import endContract from '../../snapshots/39424372aac41c6e4b4f9808e85d54ad44d1e9d2d3c214d9398725bed3b509f7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'heroSlide',
        columns: [
          col('buttonLink', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('buttonText', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', { notNull: true, codecRef: { codecId: 'pg/bool@1' } }),
          col('mediaType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('mediaUrl', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sortOrder', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'product',
        column: col('youtubeVideo', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

