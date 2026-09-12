#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/39424372aac41c6e4b4f9808e85d54ad44d1e9d2d3c214d9398725bed3b509f7/contract';
import startContract from '../../snapshots/39424372aac41c6e4b4f9808e85d54ad44d1e9d2d3c214d9398725bed3b509f7/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/6ebb20d15d2634562f394d9083344c5772c7103aaf5863e3569b57dbf565e2d6/contract';
import endContract from '../../snapshots/6ebb20d15d2634562f394d9083344c5772c7103aaf5863e3569b57dbf565e2d6/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'review',
        columns: [
          col('comment', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('productId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('rating', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('verifiedPurchase', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('review_rating_range_check_d64e03d9', '(rating >= 1 AND rating <= 5)'),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'review',
        constraint: 'review_productId_userId_key',
        columns: ['productId', 'userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'review',
        index: 'review_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'review',
        index: 'review_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'review',
        foreignKey: {
          name: 'review_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'product', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'review',
        foreignKey: {
          name: 'review_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

