export type Repo = {name:string; description:string; language:string; stars:number; forks:number; gained:number|null; url:string; created?:string};
const clean=(s:string)=>s.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'").replace(/\s+/g,' ').trim();
export function parseTrending(html:string):Repo[]{
 return [...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].flatMap(([a])=>{
  const heading=a.match(/<h2\b[\s\S]*?<\/h2>/)?.[0]||'';
  const name=heading.match(/href="\/([\w.-]+\/[\w.-]+)"/)?.[1];
  if(!name)return [];
  const metric=(suffix:string)=>{const match=a.match(new RegExp('<a[^>]*href="/'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/'+suffix+'"[^>]*>([\\s\\S]*?)<\\/a>'));return match?Number(clean(match[1]).replace(/,/g,'')):NaN};
  const gained=a.match(/([\d,]+)\s+stars\s+(?:today|this week|this month)/)?.[1];
  const stars=metric('stargazers'),forks=metric('forks');
  if(!Number.isFinite(stars)||!Number.isFinite(forks))throw new Error('GitHub changed the trending page format. Open the source link while we update the tracker.');
  return [{name,description:clean(a.match(/<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1]||''),language:clean(a.match(/itemprop="programmingLanguage"[^>]*>(.*?)<\/span>/)?.[1]||'Other'),stars,forks,gained:gained?Number(gained.replace(/,/g,'')):null,url:'https://github.com/'+name}];
 });
}
