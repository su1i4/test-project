import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  return {
    locale: locale || 'ru',
    messages: (await import(`../messages/${locale || 'ru'}.json`)).default
  };
}); 