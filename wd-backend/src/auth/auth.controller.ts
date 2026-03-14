import { Controller, Post, Body, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: any) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const result = await this.authService.googleLogin(req.user);

    if (result.needsRegistration) {
      return res.redirect(
        `${frontendUrl}/complete-profile?email=${result.email}&firstName=${result.firstName}&lastName=${result.lastName}&picture=${result.picture}`
      );
    }

    return res.redirect(
      `${frontendUrl}/auth/callback?token=${result.access_token}&user=${encodeURIComponent(JSON.stringify(result.user))}`
    );
  }

  @Post('google/complete')
  async googleComplete(@Body() body: { email: string; username: string; firstName: string; lastName: string; picture?: string }) {
  return this.authService.googleComplete(body);
}

}