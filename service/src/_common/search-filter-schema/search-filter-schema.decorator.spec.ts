import { DEFAULT_SCHEMA_OPTIONS, filterSchema } from './search-filter-schema.decorator'

describe('Test', () => {
  it('should work', () => {
    expect(true).toBe(true)
  })

  it('test string filter', () => {
    expect(
      filterSchema({
        patterns: 'game',
      }),
    ).toStrictEqual({ patterns: 'game' })
  })

  it('test boolean filter with boolean string', () => {
    expect(
      filterSchema({
        '?active': 'true',
      }),
    ).toStrictEqual({ active: true })
  })

  it('test false boolean filter with boolean string', () => {
    expect(
      filterSchema({
        '?active': 'false',
      }),
    ).toStrictEqual({ active: false })
  })

  it('test boolean filter with int string', () => {
    expect(
      filterSchema({
        '?active': '1',
      }),
    ).toStrictEqual({ active: true })
  })

  it('test int filter', () => {
    expect(
      filterSchema({
        '#age': '18',
      }),
    ).toStrictEqual({ age: 18 })
  })

  it('test not equal string filter', () => {
    expect(
      filterSchema({
        '!patterns': 'car',
      }),
    ).toStrictEqual({ patterns: { $ne: 'car' } })
  })

  it('test not equal int filter', () => {
    expect(
      filterSchema({
        '!#age': '18',
      }),
    ).toStrictEqual({ age: { $ne: 18 } })
  })

  it('test not equal int filter', () => {
    expect(
      filterSchema({
        '!#age': '18',
      }),
    ).toStrictEqual({ age: { $ne: 18 } })
  })

  it('test in string filter', () => {
    expect(
      filterSchema({
        '@patterns': ['poulet', 'cotcot'],
      }),
    ).toStrictEqual({ patterns: { $in: ['poulet', 'cotcot'] } })
  })

  it('test in bad string filter', () => {
    expect(
      filterSchema({
        '@patterns': 'wrong array',
      }),
    ).toStrictEqual({})
  })

  it('test in int filter', () => {
    expect(
      filterSchema({
        '@#age': ['18', '19'],
      }),
    ).toStrictEqual({ age: { $in: [18, 19] } })
  })

  it('test in bad string filter', () => {
    expect(
      filterSchema({
        '@#age': 'wrong array',
      }),
    ).toStrictEqual({})
  })

  it('test not in string filter', () => {
    expect(
      filterSchema({
        '!@patterns': ['bike', 'velo'],
      }),
    ).toStrictEqual({ patterns: { $nin: ['bike', 'velo'] } })
  })

  it('test not in string bad filter', () => {
    expect(
      filterSchema({
        '!@patterns': 'bad array',
      }),
    ).toStrictEqual({})
  })

  it('test not in int filter', () => {
    expect(
      filterSchema({
        '!@#age': ['21', '22'],
      }),
    ).toStrictEqual({ age: { $nin: [21, 22] } })
  })

  it('test invalid in', () => {
    expect(
      filterSchema({
        '@#age': ['not a number'],
      }),
    ).toStrictEqual({})
  })

  it('test invalid not in', () => {
    expect(
      filterSchema({
        '!@#age': ['not a number'],
      }),
    ).toStrictEqual({})
  })

  it('test invalid string', () => {
    expect(
      filterSchema({
        '=patterns': ['array in', 'string type'],
      }),
    ).toStrictEqual({})
  })

  it('test invalid int', () => {
    expect(
      filterSchema({
        '#patterns': 'not a number',
      }),
    ).toStrictEqual({})
  })

  it('test invalid regex', () => {
    expect(
      filterSchema({
        '^patterns': 'test|not-test',
      }),
    ).toStrictEqual({})
  })

  it('test valid regex', () => {
    expect(
      filterSchema({
        '^patterns': '/test|not-test/',
      }),
    ).toStrictEqual({ patterns: { $regex: 'test|not-test' } })
  })

  it('test negation string', () => {
    expect(
      filterSchema({
        '!patterns': 'game',
      }),
    ).toStrictEqual({ patterns: { $ne: 'game' } })
  })

  it('test negation number', () => {
    expect(
      filterSchema({
        '!#age': '18',
      }),
    ).toStrictEqual({ age: { $ne: 18 } })
  })

  it('test basic', () => {
    expect(
      filterSchema({
        patterns: 'test',
      }),
    ).toStrictEqual({ patterns: 'test' })
  })

  it('test date >', () => {
    expect(
      filterSchema({
        '>age': '2023-01-01T00:00',
      }),
    ).toStrictEqual({ age: { $gt: new Date('2023-01-01T00:00') } })
  })

  it('test date >=', () => {
    expect(
      filterSchema({
        '>=age': '2023-01-01T00:00',
      }),
    ).toStrictEqual({ age: { $gte: new Date('2023-01-01T00:00') } })
  })

  it('test date <', () => {
    expect(
      filterSchema({
        '<age': '2023-01-01T00:00',
      }),
    ).toStrictEqual({ age: { $lt: new Date('2023-01-01T00:00') } })
  })

  it('test date <=', () => {
    expect(
      filterSchema({
        '<=age': '2023-01-01T00:00',
      }),
    ).toStrictEqual({ age: { $lte: new Date('2023-01-01T00:00') } })
  })

  it('test int >', () => {
    expect(
      filterSchema({
        '>#type': '18',
      }),
    ).toStrictEqual({ type: { $gt: 18 } })
  })

  it('test int >=', () => {
    expect(
      filterSchema({
        '>=#type': '18',
      }),
    ).toStrictEqual({ type: { $gte: 18 } })
  })

  it('test int <', () => {
    expect(
      filterSchema({
        '<#type': '18',
      }),
    ).toStrictEqual({ type: { $lt: 18 } })
  })

  it('test int <=', () => {
    expect(
      filterSchema({
        '<=#type': '18',
      }),
    ).toStrictEqual({ type: { $lte: 18 } })
  })

  it('bad key', () => {
    expect(
      filterSchema({
        '<=#': '18',
      }),
    ).toStrictEqual({})
  })

  it('unsafe filtered', () => {
    expect(
      filterSchema({
        patterns: ['test', 'test2'],
      }),
    ).toStrictEqual({})
  })

  it('unsafe unfiltered', () => {
    expect(
      filterSchema(
        {
          patterns: ['test', 'test2'],
        },
        { unsafe: true },
      ),
    ).toStrictEqual({ patterns: ['test', 'test2'] })
  })

  it('change with default options', () => {
    expect(
      filterSchema(
        {
          patterns: ['test', 'test2'],
        },
        { unsafe: true, ...DEFAULT_SCHEMA_OPTIONS },
      ),
    ).toStrictEqual({})
  })
})