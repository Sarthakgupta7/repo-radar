import {parseTrending, type Repo} from '@/lib/repositories';
const periods=['daily','weekly','monthly'];
const languages=['','Python','TypeScript','JavaScript','Go','Rust','Java','C++','C#','Swift','Kotlin','Shell'];
const cache=new Map<string,{data:unknown;expires:number}>();
export async function GET(request:Request){
 const p=new URL(request.url).searchParams;
 const mode=p.get('mode')||'trending', period=p.get('period')||'weekly',language=p.get('language')||'',sort=p.get('sort')||'gained';
 if(!['trending','new'].includes(mode)||!periods.includes(period)||!languages.includes(language)||!['gained','stars','forks'].includes(sort))return Response.json({error:'Invalid filter.'},{status:400});
 const key=[mode,period,language,sort].join('|'); const cached=cache.get(key);
 if(cached&&cached.expires>Date.now())return Response.json(cached.data);
 try{
  let repos:Repo[],source:string,total:number;
  if(mode==='trending'){
   source='https://github.com/trending/'+encodeURIComponent(language.toLowerCase())+'?since='+period;
   const r=await fetch(source,{headers:{'User-Agent':'RepoRadar/1.0','Accept':'text/html'},signal:AbortSignal.timeout(20000)});
   if(!r.ok)throw new Error('GitHub trending is temporarily unavailable. Please retry shortly.');
   const html=await r.text(); repos=parseTrending(html);total=repos.length;
   if(!repos.length&&!html.includes('Box-row')&&!html.includes('It looks like we don'))throw new Error('GitHub returned no readable trending data. Try opening the source.');
  }else{
   const days=period==='daily'?1:period==='weekly'?7:30;
   const date=new Date(Date.now()-days*86400000).toISOString().slice(0,10);
   const q='created:>='+date+' archived:false fork:false'+(language?' language:"'+language+'"':'');
   const metric=sort==='forks'?'forks':'stars';
   const api='https://api.github.com/search/repositories?'+new URLSearchParams({q,sort:metric,order:'desc',per_page:'100'});
   source='https://github.com/search?'+new URLSearchParams({q,type:'repositories',s:metric,o:'desc'});
   const r=await fetch(api,{headers:{'User-Agent':'RepoRadar/1.0','Accept':'application/vnd.github+json'},signal:AbortSignal.timeout(20000)});
   if(!r.ok)throw new Error(r.status===403||r.status===429?'GitHub’s public search limit was reached. Retry in a minute or use the source link.':'GitHub search is temporarily unavailable. Please retry.');
   const data=await r.json() as {items:Array<{full_name:string;description:string|null;language:string|null;stargazers_count:number;forks_count:number;html_url:string;created_at:string}>;total_count:number;incomplete_results:boolean};
   if(data.incomplete_results)throw new Error('GitHub returned an incomplete search. Please retry to get a reliable ranking.');
   repos=data.items.map(r=>({name:r.full_name,description:r.description||'',language:r.language||'Other',stars:r.stargazers_count,forks:r.forks_count,gained:null,url:r.html_url,created:r.created_at}));total=data.total_count;
  }
  repos.sort((a,b)=>(sort==='gained'?(b.gained??0)-(a.gained??0):sort==='forks'?b.forks-a.forks:b.stars-a.stars));
  const data={repos,source,total,fetchedAt:new Date().toISOString(),mode,period};
  if(cache.size>100)cache.clear(); cache.set(key,{data,expires:Date.now()+300000});
  return Response.json(data);
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Unable to load GitHub data.'},{status:502});}
}
