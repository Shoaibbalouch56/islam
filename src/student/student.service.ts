import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlanCategory, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { StudentDashboardService } from './dashboard/student-dashboard.service';
import { SetupDto } from './dto/setup.dto';
import { PersonalDetailsDto } from './dto/personal-details.dto';
import { SelectCoursesDto } from './dto/select-courses.dto';
import { SelectTimeslotsDto } from './dto/select-timeslots.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PortalContentService } from '../portal-content/portal-content.service';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private dashboardService: StudentDashboardService,
    private portalContent: PortalContentService,
  ) {}

  // ---------- Reference data (dynamic from DB) ----------

  getRegions() {
    return this.prisma.region.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { code: true, name: true, flag: true },
    });
  }

  getLanguages() {
    return this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { code: true, name: true, nativeName: true, isDefault: true },
    });
  }

  getCourses() {
    return this.prisma.course.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        slug: true,
        title: true,
        description: true,
        duration: true,
        icon: true,
        thumbnail: true,
        level: true,
        rating: true,
        studentCount: true,
        isFeatured: true,
        isDashboardCategory: true,
        defaultProgressPercent: true,
      },
    });
  }

  getTimeslots() {
    return this.prisma.timeSlot.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { slug: true, label: true, startTime: true, endTime: true },
    });
  }

  async getPlans(category?: PlanCategory) {
    const where: Prisma.PlanWhereInput = { isActive: true };
    if (category) where.category = category;

    const plans = await this.prisma.plan.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });

    if (category) return plans;

    const categories = Object.values(PlanCategory).map((cat) => {
      const catPlans = plans.filter((p) => p.category === cat);
      const startingFrom = catPlans.length
        ? Math.min(...catPlans.map((p) => p.price))
        : null;
      const isPopular = catPlans.some((p) => p.isPopular);
      return {
        category: cat,
        isPopular,
        startingFrom,
        plans: catPlans,
      };
    });

    return { categories };
  }

  getAddons() {
    return this.prisma.addon.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { slug: true, name: true, description: true, price: true },
    });
  }

  getPaymentMethods() {
    return this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { slug: true, name: true, description: true },
    });
  }

  // ---------- Student onboarding ----------

  private async ensureProfile(userId: number) {
    return this.prisma.studentProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async getOnboarding(userId: number) {
    const profile = await this.ensureProfile(userId);
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });
    return { profile, subscription };
  }

  async saveSetup(userId: number, dto: SetupDto) {
    await this.ensureProfile(userId);

    if (dto.regionCode) {
      const region = await this.prisma.region.findUnique({
        where: { code: dto.regionCode },
      });
      if (!region) throw new BadRequestException('Invalid region code');
    }
    if (dto.language) {
      const lang = await this.prisma.language.findUnique({
        where: { code: dto.language },
      });
      if (!lang) throw new BadRequestException('Invalid language code');
    }

    const profile = await this.prisma.studentProfile.update({
      where: { userId },
      data: {
        regionCode: dto.regionCode,
        language: dto.language,
        timezone: dto.timezone,
      },
    });

    if (dto.language || dto.regionCode) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.language ? { language: dto.language } : {}),
          ...(dto.regionCode ? { city: dto.regionCode } : {}),
        },
      });
    }

    return profile;
  }

  async savePersonalDetails(userId: number, dto: PersonalDetailsDto) {
    await this.ensureProfile(userId);

    if (dto.phone) {
      const existing = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Phone number already in use');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        countryCode: dto.countryCode,
        age: dto.age,
        gender: dto.gender,
      },
    });

    if (dto.timezone) {
      await this.prisma.studentProfile.update({
        where: { userId },
        data: { timezone: dto.timezone },
      });
    }

    const { password: _pw, ...safeUser } = user;
    return safeUser;
  }

  async selectCourses(userId: number, dto: SelectCoursesDto) {
    await this.ensureProfile(userId);

    const valid = await this.prisma.course.findMany({
      where: { slug: { in: dto.slugs }, isActive: true },
      select: { slug: true },
    });
    const validSlugs = valid.map((c) => c.slug);
    const invalid = dto.slugs.filter((s) => !validSlugs.includes(s));
    if (invalid.length) {
      throw new BadRequestException(`Invalid course(s): ${invalid.join(', ')}`);
    }

    await this.dashboardService.seedProgressForCourses(userId, validSlugs);

    return this.prisma.studentProfile.update({
      where: { userId },
      data: { courseSlugs: validSlugs },
    });
  }

  async selectTimeslots(userId: number, dto: SelectTimeslotsDto) {
    await this.ensureProfile(userId);

    const valid = await this.prisma.timeSlot.findMany({
      where: { slug: { in: dto.slugs }, isActive: true },
      select: { slug: true },
    });
    const validSlugs = valid.map((t) => t.slug);
    const invalid = dto.slugs.filter((s) => !validSlugs.includes(s));
    if (invalid.length) {
      throw new BadRequestException(
        `Invalid timeslot(s): ${invalid.join(', ')}`,
      );
    }

    return this.prisma.studentProfile.update({
      where: { userId },
      data: {
        timeslotSlugs: validSlugs,
        ...(dto.smartScheduling !== undefined
          ? { smartScheduling: dto.smartScheduling }
          : {}),
      },
    });
  }

  // ---------- Pricing & subscription ----------

  private async computePricing(
    planId: number,
    addonSlugs: string[] = [],
    couponCode?: string,
  ) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new BadRequestException('Invalid plan');
    }

    let addonsTotal = 0;
    let addons: { slug: string; name: string; price: number }[] = [];
    if (addonSlugs.length) {
      const found = await this.prisma.addon.findMany({
        where: { slug: { in: addonSlugs }, isActive: true },
      });
      const foundSlugs = found.map((a) => a.slug);
      const invalid = addonSlugs.filter((s) => !foundSlugs.includes(s));
      if (invalid.length) {
        throw new BadRequestException(`Invalid add-on(s): ${invalid.join(', ')}`);
      }
      addons = found.map((a) => ({ slug: a.slug, name: a.name, price: a.price }));
      addonsTotal = found.reduce((sum, a) => sum + a.price, 0);
    }

    const subtotal = plan.price + addonsTotal;

    let discount = 0;
    let coupon: { code: string; discountType: string; discountValue: number } | null =
      null;
    if (couponCode) {
      const c = await this.prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (!c || !c.isActive || (c.expiresAt && c.expiresAt < new Date())) {
        throw new BadRequestException('Invalid or expired coupon');
      }
      discount =
        c.discountType === 'PERCENT'
          ? (subtotal * c.discountValue) / 100
          : c.discountValue;
      discount = Math.min(discount, subtotal);
      discount = Math.round(discount * 100) / 100;
      coupon = {
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
      };
    }

    const total = Math.round((subtotal - discount) * 100) / 100;

    return { plan, addons, addonsTotal, subtotal, discount, coupon, total };
  }

  async validateCoupon(
    code: string,
    planId?: number,
    addonSlugs: string[] = [],
  ) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon || !coupon.isActive || (coupon.expiresAt && coupon.expiresAt < new Date())) {
      throw new BadRequestException('Invalid or expired coupon');
    }

    if (!planId) {
      return {
        valid: true,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      };
    }

    const pricing = await this.computePricing(planId, addonSlugs, coupon.code);
    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      total: pricing.total,
    };
  }

  async previewSubscription(dto: CreateSubscriptionDto) {
    return this.computePricing(dto.planId, dto.addonSlugs, dto.couponCode);
  }

  async createSubscription(userId: number, dto: CreateSubscriptionDto) {
    await this.ensureProfile(userId);

    if (dto.paymentMethod) {
      const method = await this.prisma.paymentMethod.findUnique({
        where: { slug: dto.paymentMethod },
      });
      if (!method || !method.isActive) {
        throw new BadRequestException('Invalid payment method');
      }
    }

    const pricing = await this.computePricing(
      dto.planId,
      dto.addonSlugs,
      dto.couponCode,
    );

    const trialDays = parseInt(
      await this.portalContent.getSetting('student.trial_days', '7'),
      10,
    );

    const now = new Date();
    const trialEndsAt = dto.startTrial
      ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
      : null;

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId: dto.planId,
        addonSlugs: dto.addonSlugs ?? [],
        paymentMethod: dto.paymentMethod,
        couponCode: pricing.coupon?.code,
        amount: pricing.total,
        discount: pricing.discount,
        status: dto.startTrial ? 'TRIAL' : 'PENDING',
        trialEndsAt,
        startedAt: dto.startTrial ? now : null,
      },
      include: { plan: true },
    });

    await this.prisma.studentProfile.update({
      where: { userId },
      data: { onboardingComplete: true },
    });

    return { subscription, pricing };
  }

  async getSubscription(userId: number) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });
    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }
    return subscription;
  }
}
