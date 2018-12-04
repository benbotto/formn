import { ConditionLexer } from './condition-lexer';

describe('ConditionLexer()', function() {
  // Helper that parses a condition and returns a plain object for comparison.
  function parse(cond: string|object): object {
    const tokens = new ConditionLexer()
      .parse(cond);

    return JSON.parse(JSON.stringify(tokens));
  }

  describe('.parse()', function() {
    it('can parse an object or a string.', function() {
      const cond = {$eq: {name: ':name'}};
      expect(parse(cond)).toEqual(parse(JSON.stringify(cond)));
    });

    describe('terminal tests -', function() {
      const terminals = ['{', '}', '[', ']', ':', ','];

      it('parses all terminals.', function() {
        terminals.forEach(function(term) {
          expect(parse(term)).toEqual([{terminal: true, type: 'char', value: term}]);
        });
      });

      it('fails on bad terminals.', function() {
        expect(function() {
          parse('A');
        }).toThrowError('Unexpected character.  Found A.');
      });

      it('parses tokens in any order (100 random terminals used).', function() {
        const tokens   = [];
        let   sentence = '';
        let   randInd;

        for (let i = 0; i < 100; ++i) {
          randInd   = Math.floor(Math.random() * terminals.length);
          sentence += terminals[randInd];
          tokens.push({terminal: true, type: 'char', value: terminals[randInd]});
        }

        expect(parse(sentence)).toEqual(tokens);
      });
    });

    describe('string tests -', function() {
      it('correctly parses trivial condition strings.', function() {
        expect(parse(JSON.stringify('user.name')))
          .toEqual([{terminal: true, type: 'column', value: 'user.name'}]);
        expect(parse('"user.name"'))
          .toEqual([{terminal: true, type: 'column', value: 'user.name'}]);
        expect(parse('""'))
          .toEqual([{terminal: true, type: 'column', value: ''}]);
        expect(parse('"str1""str2"')).toEqual([
          {terminal: true, type: 'column', value: 'str1'},
          {terminal: true, type: 'column', value: 'str2'}
        ]);
      });

      it('parses sentences.', function() {
        expect(parse(JSON.stringify({name: 'user.name'}))).toEqual([
          {terminal: true, type: 'char', value: '{'},
          {terminal: true, type: 'column', value: 'name'},
          {terminal: true, type: 'char', value: ':'},
          {terminal: true, type: 'column', value: 'user.name'},
          {terminal: true, type: 'char', value: '}'}
        ]);
      });

      it('fails if the string ends in an opening quote.', function() {
        expect(function() {
          parse('"');
        }).toThrowError('Expected character but found EOL.');
        expect(function() {
          parse('"name":"');
        }).toThrowError('Expected character but found EOL.');
      });

      it('fails if the string is unterminated.', function() {
        expect(function() {
          parse('"name');
        }).toThrowError('Expected quote but found EOL.');
      });
    });

    describe('number tests -', function() {
      it('parses basic numbers.', function() {
        expect(parse('1')).toEqual([{terminal: true, type: 'number', value: 1}]);
        expect(parse('10')).toEqual([{terminal: true, type: 'number', value: 10}]);
        expect(parse('1.0')).toEqual([{terminal: true, type: 'number', value: 1}]);
        expect(parse('.5')).toEqual([{terminal: true, type: 'number', value: 0.5}]);
        expect(parse('-4600.532'))
          .toEqual([{terminal: true, type: 'number', value: -4600.532}]);
        expect(parse('0123')).toEqual([{terminal: true, type: 'number', value: 123}]);
        expect(function() {
          parse('46-.23');
        }).toThrowError('Expected number but found 46-.23.');
      });

      it('parases multiple numbers.', function() {
        expect(parse('1,-10,14.5')).toEqual([
          {terminal: true, type: 'number', value: 1},
          {terminal: true, type: 'char', value: ','},
          {terminal: true, type: 'number', value: -10},
          {terminal: true, type: 'char', value: ','},
          {terminal: true, type: 'number', value: 14.5}
        ]);
      });

      it('parses numbers in sentences.', function() {
        expect((parse(JSON.stringify({$gt: {age: 60}})))).toEqual([
          {terminal: true, type: 'char', value: '{'},
          {terminal: false, type: 'comparison-operator', value: '$gt'},
          {terminal: true, type: 'char', value: ':'},
          {terminal: true, type: 'char', value: '{'},
          {terminal: true, type: 'column', value: 'age'},
          {terminal: true, type: 'char', value: ':'},
          {terminal: true, type: 'number', value: 60},
          {terminal: true, type: 'char', value: '}'},
          {terminal: true, type: 'char', value: '}'}
        ]);
      });
    });

    describe('null tests -', function() {
      it('parses the null terminal.', function() {
        expect(parse('null')).toEqual([{terminal: true, type: 'null', value: null}]);
        expect(parse('nullnull')).toEqual([
          {terminal: true, type: 'null', value: null},
          {terminal: true, type: 'null', value: null}
        ]);
      });

      it('parses null terminals in strings.', function() {
        expect(parse('{"$is":{"name":null}}')).toEqual([
          {terminal: true,  type: 'char', value: '{'},
          {terminal: false, type: 'null-comparison-operator', value: '$is'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'char', value: '{'},
          {terminal: true , type: 'column', value: 'name'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'null', value: null},
          {terminal: true,  type: 'char', value: '}'},
          {terminal: true,  type: 'char', value: '}'}
        ]);
      });
    });

    describe('operator tests -', function() {
      it('parses all the boolean operators.', function() {
        expect(parse('"$and"'))
          .toEqual([{terminal: false, type: 'boolean-operator', value: '$and'}]);
        expect(parse('"$or"'))
          .toEqual([{terminal: false, type: 'boolean-operator', value: '$or'}]);
        expect(parse('"$eq"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$eq'}]);
        expect(parse('"$neq"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$neq'}]);
        expect(parse('"$lt"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$lt'}]);
        expect(parse('"$lte"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$lte'}]);
        expect(parse('"$gt"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$gt'}]);
        expect(parse('"$gte"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$gte'}]);
        expect(parse('"$like"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$like'}]);
        expect(parse('"$notLike"'))
          .toEqual([{terminal: false, type: 'comparison-operator', value: '$notLike'}]);
        expect(parse('"$in"'))
          .toEqual([{terminal: false, type: 'in-comparison-operator', value: '$in'}]);
        expect(parse('"$notIn"'))
          .toEqual([{terminal: false, type: 'in-comparison-operator', value: '$notIn'}]);
        expect(parse('"$is"'))
          .toEqual([{terminal: false, type: 'null-comparison-operator', value: '$is'}]);
        expect(parse('"$isnt"'))
          .toEqual([{terminal: false, type: 'null-comparison-operator', value: '$isnt'}]);
      });

      it('parses operators in sentences.', function() {
        const cond = {
          $and: [
            {$eq: {name: ':name'}},
            {$gt: {age: 21}}
          ]
        };

        expect(parse(JSON.stringify(cond))).toEqual([
          {terminal: true,  type: 'char', value: '{'},
          {terminal: false, type: 'boolean-operator', value: '$and'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'char', value: '['},
          {terminal: true,  type: 'char', value: '{'},
          {terminal: false, type: 'comparison-operator', value: '$eq'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'char', value: '{'},
          {terminal: true,  type: 'column', value: 'name'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'parameter', value: ':name'},
          {terminal: true,  type: 'char', value: '}'},
          {terminal: true,  type: 'char', value: '}'},
          {terminal: true,  type: 'char', value: ','},
          {terminal: true,  type: 'char', value: '{'},
          {terminal: false, type: 'comparison-operator', value: '$gt'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'char', value: '{'},
          {terminal: true,  type: 'column', value: 'age'},
          {terminal: true,  type: 'char', value: ':'},
          {terminal: true,  type: 'number', value: 21},
          {terminal: true,  type: 'char', value: '}'},
          {terminal: true,  type: 'char', value: '}'},
          {terminal: true,  type: 'char', value: ']'},
          {terminal: true,  type: 'char', value: '}'}
        ]);
      });
    });

    describe('parameter tests -', function() {
      it('parases terminal parameters.', function() {
        expect(parse(JSON.stringify(':name')))
          .toEqual([{terminal: true, type: 'parameter', value: ':name'}]);
      });

      it('parses parameters in sentences.', function() {
        expect(parse(JSON.stringify({name: ':name'}))).toEqual([
          {terminal: true, type: 'char', value: '{'},
          {terminal: true, type: 'column', value: 'name'},
          {terminal: true, type: 'char', value: ':'},
          {terminal: true, type: 'parameter', value: ':name'},
          {terminal: true, type: 'char', value: '}'}
        ]);
      });
    });
  });
});

