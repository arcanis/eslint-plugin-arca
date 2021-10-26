import {possibleStandardNames} from './misc/possibleStandardNames';

export function camelize(str: string) {
  if (str === str.toUpperCase())
    str = str.toLowerCase();

  if (Object.prototype.hasOwnProperty.call(possibleStandardNames, str))
    return possibleStandardNames[str];

  return str.replace(/-+([a-z])/gi, (_, $1) => {
    return $1.toUpperCase();
  });
}
