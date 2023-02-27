import { adminSchema } from './admin.schema';
import { pendingPaymentSchema } from './pendingPayment.schema';
import { TransactionSchema } from './transaction.schema';
import { UserSchema } from './user.schema';

export const appSchemas = [
  { name: 'User', schema: UserSchema },
  { name: 'PendingPayment', schema: pendingPaymentSchema },
  { name: 'Transaction', schema: TransactionSchema },
  { name: 'Admin', schema: adminSchema },
];
