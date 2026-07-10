import type { ClassStatus, ClassType, TeacherClass, User } from '@prisma/client';

export const TEACHER_QUICK_LINKS = [
  { id: 'my-classes', label: 'My Classes', icon: 'graduation-cap' },
  { id: 'set-schedule', label: 'Set Schedule', icon: 'calendar' },
  { id: 'my-rating', label: 'My Rating', icon: 'star' },
] as const;

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDisplayTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatDisplayTime(startTime)} - ${formatDisplayTime(endTime)}`;
}

export function classTypeLabel(type: ClassType): string {
  switch (type) {
    case 'SEPARATE':
      return 'Separate';
    case 'JOINT':
      return 'Joint';
    case 'GROUP':
      return 'Group Class';
    default:
      return type;
  }
}

export function statusLabel(status: ClassStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'ACCEPTED':
    case 'UPCOMING':
      return 'Upcoming';
    case 'LIVE':
      return 'Live';
    case 'COMPLETED':
      return 'Completed';
    case 'REJECTED':
      return 'Rejected';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

type ClassWithEnrollments = TeacherClass & {
  enrollments: Array<{
    student: Pick<User, 'id' | 'fullName' | 'avatar'>;
  }>;
};

export function mapStudentPreview(
  enrollments: ClassWithEnrollments['enrollments'],
) {
  const visible = enrollments.slice(0, 5).map((e) => ({
    id: e.student.id,
    fullName: e.student.fullName,
    avatar: e.student.avatar,
    initials: getInitials(e.student.fullName),
  }));
  const overflow = Math.max(0, enrollments.length - visible.length);

  return { students: visible, overflow };
}

export function mapClassCard(cls: ClassWithEnrollments) {
  const primaryStudent = cls.enrollments[0]?.student;
  const { students, overflow } = mapStudentPreview(cls.enrollments);

  return {
    id: cls.id,
    title: cls.title,
    description: cls.description,
    classType: cls.classType,
    classTypeLabel: classTypeLabel(cls.classType),
    studentName: primaryStudent?.fullName ?? null,
    students,
    studentOverflow: overflow > 0 ? `+${overflow}` : null,
    date: formatDisplayDate(cls.scheduledDate),
    scheduledDate: cls.scheduledDate.toISOString().slice(0, 10),
    startTime: formatDisplayTime(cls.startTime),
    endTime: formatDisplayTime(cls.endTime),
    timeRange: formatTimeRange(cls.startTime, cls.endTime),
    thumbnail: cls.thumbnail,
    status: cls.status,
    statusLabel: statusLabel(cls.status),
    isGroupClass: cls.isGroupClass,
    canAccept: cls.status === 'PENDING',
    canReject: cls.status === 'PENDING',
    canStartLive: cls.status === 'ACCEPTED' || cls.status === 'UPCOMING',
    isCompleted: cls.status === 'COMPLETED',
  };
}
