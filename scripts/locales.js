
const dictionaries = {
  ja: {
    articles: '展示品一覧', rss: 'RSS', search: '展示品を検索', searchPlaceholder: '名前・説明文から検索',
    noArticles: '展示品はまだありません。', noDate: '年代未設定',
    introTitle: 'ZIPPOの魅力を、時代を超えて。', introDescription: '年代物のZIPPOライターを写真とともに紹介するコレクションギャラリー。',
    sideDescription: '長年集めてきたZIPPOライターを、一つひとつ記録・展示しています。',
    toc: '目次', summary: '概要', next: '次の展示品',
    author: 'コレクターについて', profile: 'コレクションを見る',
    recommendations: 'おすすめの展示品', moreArticles: 'ほかの展示品を見る',
    backToArticles: '← 展示品一覧へ戻る', articleActions: '展示品の操作',
    copyCode: 'コードをコピー', copyCodeSuccess: 'コードをコピーしました', copyCodeFailure: 'コードをコピーできませんでした',
    copyLink: '展示品のリンクをコピー', shareArticle: '展示品を共有',
    linkCopying: 'リンクをコピーしています…', sharing: '共有しています…',
    linkCopied: '展示品のリンクをコピーしました', copyFailed: 'コピーできませんでした',
    shared: '共有しました', shareCancelled: '共有をキャンセルしました',
    urlCopied: 'URLをコピーしました', shareFailed: 'コピーできませんでした。URLをアドレスバーからコピーしてください。',
    languageName: 'English',
  },
  en: {
    articles: 'Collection', rss: 'RSS', search: 'Search collection', searchPlaceholder: 'Search by name or description',
    noArticles: 'No items on display yet.', noDate: 'Year not specified',
    introTitle: 'The timeless appeal of ZIPPO.', introDescription: 'A personal gallery showcasing vintage ZIPPO lighters through photographs and their history.',
    sideDescription: 'A personal collection of ZIPPO lighters, carefully documented and displayed.',
    toc: 'Contents', summary: 'Overview', next: 'Next exhibit',
    author: 'About the collector', profile: 'View collection',
    recommendations: 'Featured exhibits', moreArticles: 'Explore more exhibits',
    backToArticles: '← Back to collection', articleActions: 'Exhibit actions',
    copyCode: 'Copy code', copyCodeSuccess: 'Code copied', copyCodeFailure: 'Could not copy code',
    copyLink: 'Copy exhibit link', shareArticle: 'Share exhibit',
    linkCopying: 'Copying link…', sharing: 'Sharing…',
    linkCopied: 'Exhibit link copied', copyFailed: 'Could not copy',
    shared: 'Shared', shareCancelled: 'Sharing cancelled',
    urlCopied: 'URL copied', shareFailed: 'Could not copy. Please copy the exhibit URL from the address bar.',
    languageName: '日本語',
  },
};


export function localeKey(language = 'ja') {
  return /^en(?:-|$)/i.test(String(language)) ? 'en' : 'ja';
}

export function localeText(language = 'ja') {
  return dictionaries[localeKey(language)];
}

export function htmlLanguage(language = 'ja') {
  const key = localeKey(language);
  return key === 'en' ? 'en-US' : 'ja-JP';
}

export function formatDate(value, language = 'ja') {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(htmlLanguage(language), {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  }).format(date);
}
