import { prisma } from './index';

/**
 * 트랜잭션 헬퍼 함수
 */
export async function withTransaction<T>(
  fn: (tx: typeof prisma) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return fn(tx as typeof prisma);
  });
}

/**
 * Soft delete 헬퍼
 */
export async function softDelete(
  model: any,
  id: string
): Promise<void> {
  await model.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}

/**
 * 페이지네이션 헬퍼
 */
export interface IPaginationOptions {
  page: number;
  limit: number;
  orderBy?: any;
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export async function paginate<T>(
  model: any,
  options: IPaginationOptions,
  where?: any
): Promise<IPaginatedResult<T>> {
  const { page, limit, orderBy } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy
    }),
    model.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

/**
 * History Log 생성 헬퍼
 */
export async function createHistoryLog(params: {
  userId: string;
  storeId: string;
  action: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  oldData?: any;
  newData?: any;
}) {
  return prisma.historyLog.create({
    data: {
      userId: params.userId,
      storeId: params.storeId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldData: params.oldData || undefined,
      newData: params.newData || undefined,
      isUndoable: true
    }
  });
}