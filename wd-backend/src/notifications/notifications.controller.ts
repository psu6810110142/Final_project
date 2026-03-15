import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user?.sub || req.user?.user_id;
    return this.notifService.findByUser(userId);
  }

  @Get('unread-count')
  unreadCount(@Req() req: any) {
    const userId = req.user?.sub || req.user?.user_id;
    return this.notifService.countUnread(userId);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.user_id;
    return this.notifService.markRead(+id, userId);
  }

  @Patch('read-all')
  markAllRead(@Req() req: any) {
    const userId = req.user?.sub || req.user?.user_id;
    return this.notifService.markAllRead(userId);
  }
}
