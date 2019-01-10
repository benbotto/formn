import { DefaultColumnFormatter, ModelColumn } from '../';

describe('DefaultColumnFormatter()', () => {
  let formatter: DefaultColumnFormatter;

  beforeEach(() => formatter = new DefaultColumnFormatter());

  describe('.formatPropertyName()', () => {
    it('returns "id" for primary generated columns.', () => {
      const col = new ModelColumn(formatter);
      col.setName('personID');
      col.setIsPrimary(true);
      col.setIsGenerated(true);

      expect(col.getPropertyName()).toBe('id');
    });

    it('returns the camel case version of the name.', () => {
      const col = new ModelColumn(formatter);
      col.setName('likes_to_eat_cake');
      expect(col.getPropertyName()).toBe('likesToEatCake');
    });
  });
});

