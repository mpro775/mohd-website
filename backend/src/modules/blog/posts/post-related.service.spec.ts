import { scoreRelatedPost } from './post-related.service';

describe('related post scoring', () => {
  it('scores same category by five and each shared tag by two', () => {
    expect(
      scoreRelatedPost(
        { category: 'c1', tags: ['t1', 't2'] },
        { category: 'c1', tags: ['t2'] },
      ),
    ).toBe(7);
    expect(
      scoreRelatedPost(
        { category: 'c1', tags: ['t1'] },
        { category: 'c2', tags: ['t1'] },
      ),
    ).toBe(2);
  });
});
