import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SaveLocationDto } from './dto/save-location.dto';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const COMPASS_POINTS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
];

@Injectable()
export class QiblaService {
  constructor(private prisma: PrismaService) {}

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  private toDeg(rad: number): number {
    return (rad * 180) / Math.PI;
  }

  private compassLabel(bearing: number): string {
    const index = Math.round(bearing / 22.5) % 16;
    return COMPASS_POINTS[index];
  }

  private haversineKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  computeQibla(lat: number, lng: number) {
    const phiK = this.toRad(KAABA_LAT);
    const phi = this.toRad(lat);
    const deltaLng = this.toRad(KAABA_LNG - lng);

    const y = Math.sin(deltaLng);
    const x =
      Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLng);
    let bearing = this.toDeg(Math.atan2(y, x));
    bearing = (bearing + 360) % 360;

    const distanceKm = this.haversineKm(lat, lng, KAABA_LAT, KAABA_LNG);

    return {
      direction: Math.round(bearing * 100) / 100,
      compass: this.compassLabel(bearing),
      distanceKm: Math.round(distanceKm),
      coordinates: { lat, lng },
      kaaba: { lat: KAABA_LAT, lng: KAABA_LNG },
    };
  }

  async getQibla(userId: number, lat?: number, lng?: number) {
    if (lat !== undefined && lng !== undefined) {
      return this.computeQibla(lat, lng);
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (
      user &&
      user.latitude !== null &&
      user.longitude !== null &&
      user.latitude !== undefined &&
      user.longitude !== undefined
    ) {
      return {
        ...this.computeQibla(user.latitude, user.longitude),
        city: user.city,
        source: 'saved',
      };
    }

    throw new BadRequestException(
      'Provide lat & lng, or save a location first via POST /qibla/location',
    );
  }

  async saveLocation(userId: number, dto: SaveLocationDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { latitude: dto.lat, longitude: dto.lng, city: dto.city },
    });

    return {
      message: 'Location saved',
      city: user.city,
      qibla: this.computeQibla(dto.lat, dto.lng),
    };
  }
}
