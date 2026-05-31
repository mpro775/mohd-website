import { FaqsService } from './faqs.service';

describe('FaqsService', () => {
  it('returns public FAQs with pagination meta', async () => {
    const query = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{ question: 'Q' }]),
    };
    const faqModel = {
      find: jest.fn().mockReturnValue(query),
      countDocuments: jest.fn().mockResolvedValue(1),
    };
    const service = new FaqsService(faqModel as any, { log: jest.fn() } as any);

    const result = await service.findAllPublic({ page: 1, limit: 10 });

    expect(faqModel.find).toHaveBeenCalledWith({ isPublished: true });
    expect(result.meta.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });
});
