
import { Controller, Post, Body, Req, UseGuards, Headers, RawBody, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { CheckoutDto } from '../shared/dto/payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post('checkout')
  async checkout(@Body() dto: CheckoutDto, @Req() req) {
    return this.paymentsService.createCheckoutSession(dto.courseIds, req.user.id);
  }

  @Public()
  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') sig: string,
    // Fix: Using any for raw body to avoid Buffer reference issues if @types/node is missing
    @RawBody() body: any,
  ) {
    if (!sig) throw new BadRequestException('Missing stripe-signature header');
    return this.paymentsService.handleWebhook(sig, body);
  }
}
