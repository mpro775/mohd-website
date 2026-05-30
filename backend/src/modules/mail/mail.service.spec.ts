import { MailService } from './mail.service';

describe('MailService', () => {
  it('does not throw when SMTP is not configured', async () => {
    const service = new MailService({
      get: jest.fn().mockReturnValue(''),
    } as any);

    await expect(
      service.sendContactNotification({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Hello',
        message: 'Message',
      }),
    ).resolves.toBeUndefined();
  });
});
