import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { PlanCategory, User } from '@prisma/client';
import { GetUser } from '../auth/get-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { StudentService } from './student.service';
import { SetupDto } from './dto/setup.dto';
import { PersonalDetailsDto } from './dto/personal-details.dto';
import { SelectCoursesDto } from './dto/select-courses.dto';
import { SelectTimeslotsDto } from './dto/select-timeslots.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@ApiTags('Student')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.STUDENT)
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // ----- Reference data -----

  @Get('regions')
  getRegions() {
    return this.studentService.getRegions();
  }

  @Get('languages')
  getLanguages() {
    return this.studentService.getLanguages();
  }

  @Get('courses')
  getCourses() {
    return this.studentService.getCourses();
  }

  @Get('timeslots')
  getTimeslots() {
    return this.studentService.getTimeslots();
  }

  @Get('plans')
  getPlans(@Query('category') category?: PlanCategory) {
    return this.studentService.getPlans(category);
  }

  @Get('addons')
  getAddons() {
    return this.studentService.getAddons();
  }

  @Get('payment-methods')
  getPaymentMethods() {
    return this.studentService.getPaymentMethods();
  }

  // ----- Onboarding -----

  @Get('onboarding')
  getOnboarding(@GetUser() user: User) {
    return this.studentService.getOnboarding(user.id);
  }

  @Patch('setup')
  saveSetup(@GetUser() user: User, @Body() dto: SetupDto) {
    return this.studentService.saveSetup(user.id, dto);
  }

  @Patch('personal')
  savePersonal(@GetUser() user: User, @Body() dto: PersonalDetailsDto) {
    return this.studentService.savePersonalDetails(user.id, dto);
  }

  @Put('courses')
  selectCourses(@GetUser() user: User, @Body() dto: SelectCoursesDto) {
    return this.studentService.selectCourses(user.id, dto);
  }

  @Put('timeslots')
  selectTimeslots(@GetUser() user: User, @Body() dto: SelectTimeslotsDto) {
    return this.studentService.selectTimeslots(user.id, dto);
  }

  // ----- Plan / subscription -----

  @Post('coupon/validate')
  validateCoupon(@Body() dto: ValidateCouponDto) {
    return this.studentService.validateCoupon(
      dto.code,
      dto.planId,
      dto.addonSlugs,
    );
  }

  @Post('subscription/preview')
  previewSubscription(@Body() dto: CreateSubscriptionDto) {
    return this.studentService.previewSubscription(dto);
  }

  @Post('subscription')
  createSubscription(
    @GetUser() user: User,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.studentService.createSubscription(user.id, dto);
  }

  @Get('subscription')
  getSubscription(@GetUser() user: User) {
    return this.studentService.getSubscription(user.id);
  }
}
