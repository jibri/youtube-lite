import {buildQueryString} from 'src/utils/youtubeApi';

describe('buildQureyString', () => {
  it('should build queries', () => {
    expect(
      buildQueryString({
        part: 'snippet',
        maxResult: 50,
        mine: true,
        key: ['key1', 'key2'],
        notDefined: undefined,
        isNull: null,
        emptyString: '',
        zero: 0,
        faux: false,
        emptyArray: [],
      }),
    ).toEqual(
      '?part=snippet&maxResult=50&mine=true&key=key1,key2&notDefined=&isNull=&emptyString=&zero=0&faux=false&emptyArray=',
    );
  });
});
