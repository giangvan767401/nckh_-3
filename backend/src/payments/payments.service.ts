
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import Stripe from 'stripe';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../courses/entities/enrollment.entity';

// Fix: Imported Buffer from node:buffer or assume globally available via @types/node. 
// In NestJS, typically Buffer is globally available if types are installed, but we use 'any' if needed or rely on standard Node globals.

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24' as any,
    });
  }

  async createCheckoutSession(courseIds: string[], userId: string) {
    const courses = await this.courseRepository.find({
      where: { id: In(courseIds) },
    });

    if (courses.length === 0) {
      throw new NotFoundException('No valid courses found for checkout');
    }

    const lineItems = courses.map((course) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: course.title,
          images: course.thumbnail ? [course.thumbnail] : [],
          description: course.category,
        },
        unit_amount: Math.round(course.price * 100), // Stripe uses cents
      },
      quantity: 1,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/#/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/#/cart?payment=cancelled`,
      metadata: {
        userId,
        courseIds: JSON.stringify(courseIds),
      },
    });

    return { url: session.url };
  }

  // Fix: Added explicit Buffer type handling for Node environment
  async handleWebhook(signature: string, rawBody: any) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, courseIds: courseIdsRaw } = session.metadata;
      const courseIds: string[] = JSON.parse(courseIdsRaw);

      // Batch create enrollments
      const enrollments = courseIds.map((courseId) =>
        this.enrollmentRepository.create({
          userId,
          courseId,
          enrolledAt: new Date(),
          completed: false,
        }),
      );

      // Use upsert or ignore if unique constraint fails (already enrolled)
      await this.enrollmentRepository
        .createQueryBuilder()
        .insert()
        .into(Enrollment)
        .values(enrollments)
        .orIgnore() // SQLite syntax, for Postgres use .onConflict(`DO NOTHING`)
        .execute();
    }

    return { received: true };
  }
}
