import { Resolver } from '@nestjs/graphql';
import { CreatePaymentOutput } from './dtos/create-payment.dto';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payment.service';

@Resolver((of) => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}


  @Mutation(returns=>CreatePaymentOutput)
}
