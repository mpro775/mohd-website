import { ContactService } from './contact.service';

describe('ContactService', () => {
  it('returns fake success path for honeypot submissions without saving', async () => {
    const contactModel = jest.fn();
    const service = new ContactService(
      contactModel as any,
      { sendContactNotification: jest.fn() } as any,
      { log: jest.fn() } as any,
    );

    const result = await service.create(
      {
        website: 'bot-value',
        fullName: 'Bot',
        email: 'bot@example.com',
        subject: 'Hello',
        message: 'This should not be saved',
      },
      '127.0.0.1',
    );

    expect(result).toBeNull();
    expect(contactModel).not.toHaveBeenCalled();
  });
});
