var It=Object.defineProperty;var qe=e=>{throw TypeError(e)};var St=(e,t,r)=>t in e?It(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var _=(e,t,r)=>St(e,typeof t!="symbol"?t+"":t,r),Me=(e,t,r)=>t.has(e)||qe("Cannot "+r);var u=(e,t,r)=>(Me(e,t,"read from private field"),r?r.call(e):t.get(e)),w=(e,t,r)=>t.has(e)?qe("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,r),g=(e,t,r,s)=>(Me(e,t,"write to private field"),s?s.call(e,r):t.set(e,r),r),v=(e,t,r)=>(Me(e,t,"access private method"),r);var Ve=(e,t,r,s)=>({set _(n){g(e,t,n,r)},get _(){return u(e,t,s)}});var Ye=(e,t,r)=>(s,n)=>{let a=-1;return o(0);async function o(i){if(i<=a)throw new Error("next() called multiple times");a=i;let c,d=!1,l;if(e[i]?(l=e[i][0][0],s.req.routeIndex=i):l=i===e.length&&n||void 0,l)try{c=await l(s,()=>o(i+1))}catch(p){if(p instanceof Error&&t)s.error=p,c=await t(p,s),d=!0;else throw p}else s.finalized===!1&&r&&(c=await r(s));return c&&(s.finalized===!1||d)&&(s.res=c),s}},Dt=Symbol(),jt=async(e,t=Object.create(null))=>{const{all:r=!1,dot:s=!1}=t,a=(e instanceof ct?e.raw.headers:e.headers).get("Content-Type");return a!=null&&a.startsWith("multipart/form-data")||a!=null&&a.startsWith("application/x-www-form-urlencoded")?At(e,{all:r,dot:s}):{}};async function At(e,t){const r=await e.formData();return r?kt(r,t):{}}function kt(e,t){const r=Object.create(null);return e.forEach((s,n)=>{t.all||n.endsWith("[]")?xt(r,n,s):r[n]=s}),t.dot&&Object.entries(r).forEach(([s,n])=>{s.includes(".")&&(Ot(r,s,n),delete r[s])}),r}var xt=(e,t,r)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(r):e[t]=[e[t],r]:t.endsWith("[]")?e[t]=[r]:e[t]=r},Ot=(e,t,r)=>{let s=e;const n=t.split(".");n.forEach((a,o)=>{o===n.length-1?s[a]=r:((!s[a]||typeof s[a]!="object"||Array.isArray(s[a])||s[a]instanceof File)&&(s[a]=Object.create(null)),s=s[a])})},st=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},Ct=e=>{const{groups:t,path:r}=Nt(e),s=st(r);return Pt(s,t)},Nt=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(r,s)=>{const n=`@${s}`;return t.push([n,r]),n}),{groups:t,path:e}},Pt=(e,t)=>{for(let r=t.length-1;r>=0;r--){const[s]=t[r];for(let n=e.length-1;n>=0;n--)if(e[n].includes(s)){e[n]=e[n].replace(s,t[r][1]);break}}return e},ke={},Ut=(e,t)=>{if(e==="*")return"*";const r=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(r){const s=`${e}#${t}`;return ke[s]||(r[2]?ke[s]=t&&t[0]!==":"&&t[0]!=="*"?[s,r[1],new RegExp(`^${r[2]}(?=/${t})`)]:[e,r[1],new RegExp(`^${r[2]}$`)]:ke[s]=[e,r[1],!0]),ke[s]}return null},We=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,r=>{try{return t(r)}catch{return r}})}},Lt=e=>We(e,decodeURI),nt=e=>{const t=e.url,r=t.indexOf("/",t.indexOf(":")+4);let s=r;for(;s<t.length;s++){const n=t.charCodeAt(s);if(n===37){const a=t.indexOf("?",s),o=t.slice(r,a===-1?void 0:a);return Lt(o.includes("%25")?o.replace(/%25/g,"%2525"):o)}else if(n===63)break}return t.slice(r,s)},Mt=e=>{const t=nt(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},ue=(e,t,...r)=>(r.length&&(t=ue(t,...r)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),at=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),r=[];let s="";return t.forEach(n=>{if(n!==""&&!/\:/.test(n))s+="/"+n;else if(/\:/.test(n))if(/\?/.test(n)){r.length===0&&s===""?r.push("/"):r.push(s);const a=n.replace("?","");s+="/"+a,r.push(s)}else s+="/"+n}),r.filter((n,a,o)=>o.indexOf(n)===a)},He=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?We(e,it):e):e,ot=(e,t,r)=>{let s;if(!r&&t&&!/[%+]/.test(t)){let o=e.indexOf("?",8);if(o===-1)return;for(e.startsWith(t,o+1)||(o=e.indexOf(`&${t}`,o+1));o!==-1;){const i=e.charCodeAt(o+t.length+1);if(i===61){const c=o+t.length+2,d=e.indexOf("&",c);return He(e.slice(c,d===-1?void 0:d))}else if(i==38||isNaN(i))return"";o=e.indexOf(`&${t}`,o+1)}if(s=/[%+]/.test(e),!s)return}const n={};s??(s=/[%+]/.test(e));let a=e.indexOf("?",8);for(;a!==-1;){const o=e.indexOf("&",a+1);let i=e.indexOf("=",a);i>o&&o!==-1&&(i=-1);let c=e.slice(a+1,i===-1?o===-1?void 0:o:i);if(s&&(c=He(c)),a=o,c==="")continue;let d;i===-1?d="":(d=e.slice(i+1,o===-1?void 0:o),s&&(d=He(d))),r?(n[c]&&Array.isArray(n[c])||(n[c]=[]),n[c].push(d)):n[c]??(n[c]=d)}return t?n[t]:n},Ht=ot,Ft=(e,t)=>ot(e,t,!0),it=decodeURIComponent,Ke=e=>We(e,it),fe,L,Y,dt,lt,Be,K,Xe,ct=(Xe=class{constructor(e,t="/",r=[[]]){w(this,Y);_(this,"raw");w(this,fe);w(this,L);_(this,"routeIndex",0);_(this,"path");_(this,"bodyCache",{});w(this,K,e=>{const{bodyCache:t,raw:r}=this,s=t[e];if(s)return s;const n=Object.keys(t)[0];return n?t[n].then(a=>(n==="json"&&(a=JSON.stringify(a)),new Response(a)[e]())):t[e]=r[e]()});this.raw=e,this.path=t,g(this,L,r),g(this,fe,{})}param(e){return e?v(this,Y,dt).call(this,e):v(this,Y,lt).call(this)}query(e){return Ht(this.url,e)}queries(e){return Ft(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((r,s)=>{t[s]=r}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await jt(this,e))}json(){return u(this,K).call(this,"text").then(e=>JSON.parse(e))}text(){return u(this,K).call(this,"text")}arrayBuffer(){return u(this,K).call(this,"arrayBuffer")}blob(){return u(this,K).call(this,"blob")}formData(){return u(this,K).call(this,"formData")}addValidatedData(e,t){u(this,fe)[e]=t}valid(e){return u(this,fe)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[Dt](){return u(this,L)}get matchedRoutes(){return u(this,L)[0].map(([[,e]])=>e)}get routePath(){return u(this,L)[0].map(([[,e]])=>e)[this.routeIndex].path}},fe=new WeakMap,L=new WeakMap,Y=new WeakSet,dt=function(e){const t=u(this,L)[0][this.routeIndex][1][e],r=v(this,Y,Be).call(this,t);return r&&/\%/.test(r)?Ke(r):r},lt=function(){const e={},t=Object.keys(u(this,L)[0][this.routeIndex][1]);for(const r of t){const s=v(this,Y,Be).call(this,u(this,L)[0][this.routeIndex][1][r]);s!==void 0&&(e[r]=/\%/.test(s)?Ke(s):s)}return e},Be=function(e){return u(this,L)[1]?u(this,L)[1][e]:e},K=new WeakMap,Xe),Bt={Stringify:1},ut=async(e,t,r,s,n)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const a=e.callbacks;return a!=null&&a.length?(n?n[0]+=e:n=[e],Promise.all(a.map(i=>i({phase:t,buffer:n,context:s}))).then(i=>Promise.all(i.filter(Boolean).map(c=>ut(c,t,!1,s,n))).then(()=>n[0]))):Promise.resolve(e)},$t="text/plain; charset=UTF-8",Fe=(e,t)=>({"Content-Type":e,...t}),Re,Ie,$,he,W,O,Se,ge,_e,se,De,je,G,pe,Qe,Wt=(Qe=class{constructor(e,t){w(this,G);w(this,Re);w(this,Ie);_(this,"env",{});w(this,$);_(this,"finalized",!1);_(this,"error");w(this,he);w(this,W);w(this,O);w(this,Se);w(this,ge);w(this,_e);w(this,se);w(this,De);w(this,je);_(this,"render",(...e)=>(u(this,ge)??g(this,ge,t=>this.html(t)),u(this,ge).call(this,...e)));_(this,"setLayout",e=>g(this,Se,e));_(this,"getLayout",()=>u(this,Se));_(this,"setRenderer",e=>{g(this,ge,e)});_(this,"header",(e,t,r)=>{this.finalized&&g(this,O,new Response(u(this,O).body,u(this,O)));const s=u(this,O)?u(this,O).headers:u(this,se)??g(this,se,new Headers);t===void 0?s.delete(e):r!=null&&r.append?s.append(e,t):s.set(e,t)});_(this,"status",e=>{g(this,he,e)});_(this,"set",(e,t)=>{u(this,$)??g(this,$,new Map),u(this,$).set(e,t)});_(this,"get",e=>u(this,$)?u(this,$).get(e):void 0);_(this,"newResponse",(...e)=>v(this,G,pe).call(this,...e));_(this,"body",(e,t,r)=>v(this,G,pe).call(this,e,t,r));_(this,"text",(e,t,r)=>!u(this,se)&&!u(this,he)&&!t&&!r&&!this.finalized?new Response(e):v(this,G,pe).call(this,e,t,Fe($t,r)));_(this,"json",(e,t,r)=>v(this,G,pe).call(this,JSON.stringify(e),t,Fe("application/json",r)));_(this,"html",(e,t,r)=>{const s=n=>v(this,G,pe).call(this,n,t,Fe("text/html; charset=UTF-8",r));return typeof e=="object"?ut(e,Bt.Stringify,!1,{}).then(s):s(e)});_(this,"redirect",(e,t)=>{const r=String(e);return this.header("Location",/[^\x00-\xFF]/.test(r)?encodeURI(r):r),this.newResponse(null,t??302)});_(this,"notFound",()=>(u(this,_e)??g(this,_e,()=>new Response),u(this,_e).call(this,this)));g(this,Re,e),t&&(g(this,W,t.executionCtx),this.env=t.env,g(this,_e,t.notFoundHandler),g(this,je,t.path),g(this,De,t.matchResult))}get req(){return u(this,Ie)??g(this,Ie,new ct(u(this,Re),u(this,je),u(this,De))),u(this,Ie)}get event(){if(u(this,W)&&"respondWith"in u(this,W))return u(this,W);throw Error("This context has no FetchEvent")}get executionCtx(){if(u(this,W))return u(this,W);throw Error("This context has no ExecutionContext")}get res(){return u(this,O)||g(this,O,new Response(null,{headers:u(this,se)??g(this,se,new Headers)}))}set res(e){if(u(this,O)&&e){e=new Response(e.body,e);for(const[t,r]of u(this,O).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const s=u(this,O).headers.getSetCookie();e.headers.delete("set-cookie");for(const n of s)e.headers.append("set-cookie",n)}else e.headers.set(t,r)}g(this,O,e),this.finalized=!0}get var(){return u(this,$)?Object.fromEntries(u(this,$)):{}}},Re=new WeakMap,Ie=new WeakMap,$=new WeakMap,he=new WeakMap,W=new WeakMap,O=new WeakMap,Se=new WeakMap,ge=new WeakMap,_e=new WeakMap,se=new WeakMap,De=new WeakMap,je=new WeakMap,G=new WeakSet,pe=function(e,t,r){const s=u(this,O)?new Headers(u(this,O).headers):u(this,se)??new Headers;if(typeof t=="object"&&"headers"in t){const a=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[o,i]of a)o.toLowerCase()==="set-cookie"?s.append(o,i):s.set(o,i)}if(r)for(const[a,o]of Object.entries(r))if(typeof o=="string")s.set(a,o);else{s.delete(a);for(const i of o)s.append(a,i)}const n=typeof t=="number"?t:(t==null?void 0:t.status)??u(this,he);return new Response(e,{status:n,headers:s})},Qe),I="ALL",qt="all",Vt=["get","post","put","delete","options","patch"],pt="Can not add a route since the matcher is already built.",mt=class extends Error{},Yt="__COMPOSED_HANDLER",Kt=e=>e.text("404 Not Found",404),Ge=(e,t)=>{if("getResponse"in e){const r=e.getResponse();return t.newResponse(r.body,r)}return console.error(e),t.text("Internal Server Error",500)},M,S,ft,H,te,xe,Oe,Ee,Gt=(Ee=class{constructor(t={}){w(this,S);_(this,"get");_(this,"post");_(this,"put");_(this,"delete");_(this,"options");_(this,"patch");_(this,"all");_(this,"on");_(this,"use");_(this,"router");_(this,"getPath");_(this,"_basePath","/");w(this,M,"/");_(this,"routes",[]);w(this,H,Kt);_(this,"errorHandler",Ge);_(this,"onError",t=>(this.errorHandler=t,this));_(this,"notFound",t=>(g(this,H,t),this));_(this,"fetch",(t,...r)=>v(this,S,Oe).call(this,t,r[1],r[0],t.method));_(this,"request",(t,r,s,n)=>t instanceof Request?this.fetch(r?new Request(t,r):t,s,n):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${ue("/",t)}`,r),s,n)));_(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(v(this,S,Oe).call(this,t.request,t,void 0,t.request.method))})});[...Vt,qt].forEach(a=>{this[a]=(o,...i)=>(typeof o=="string"?g(this,M,o):v(this,S,te).call(this,a,u(this,M),o),i.forEach(c=>{v(this,S,te).call(this,a,u(this,M),c)}),this)}),this.on=(a,o,...i)=>{for(const c of[o].flat()){g(this,M,c);for(const d of[a].flat())i.map(l=>{v(this,S,te).call(this,d.toUpperCase(),u(this,M),l)})}return this},this.use=(a,...o)=>(typeof a=="string"?g(this,M,a):(g(this,M,"*"),o.unshift(a)),o.forEach(i=>{v(this,S,te).call(this,I,u(this,M),i)}),this);const{strict:s,...n}=t;Object.assign(this,n),this.getPath=s??!0?t.getPath??nt:Mt}route(t,r){const s=this.basePath(t);return r.routes.map(n=>{var o;let a;r.errorHandler===Ge?a=n.handler:(a=async(i,c)=>(await Ye([],r.errorHandler)(i,()=>n.handler(i,c))).res,a[Yt]=n.handler),v(o=s,S,te).call(o,n.method,n.path,a)}),this}basePath(t){const r=v(this,S,ft).call(this);return r._basePath=ue(this._basePath,t),r}mount(t,r,s){let n,a;s&&(typeof s=="function"?a=s:(a=s.optionHandler,s.replaceRequest===!1?n=c=>c:n=s.replaceRequest));const o=a?c=>{const d=a(c);return Array.isArray(d)?d:[d]}:c=>{let d;try{d=c.executionCtx}catch{}return[c.env,d]};n||(n=(()=>{const c=ue(this._basePath,t),d=c==="/"?0:c.length;return l=>{const p=new URL(l.url);return p.pathname=p.pathname.slice(d)||"/",new Request(p,l)}})());const i=async(c,d)=>{const l=await r(n(c.req.raw),...o(c));if(l)return l;await d()};return v(this,S,te).call(this,I,ue(t,"*"),i),this}},M=new WeakMap,S=new WeakSet,ft=function(){const t=new Ee({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,g(t,H,u(this,H)),t.routes=this.routes,t},H=new WeakMap,te=function(t,r,s){t=t.toUpperCase(),r=ue(this._basePath,r);const n={basePath:this._basePath,path:r,method:t,handler:s};this.router.add(t,r,[s,n]),this.routes.push(n)},xe=function(t,r){if(t instanceof Error)return this.errorHandler(t,r);throw t},Oe=function(t,r,s,n){if(n==="HEAD")return(async()=>new Response(null,await v(this,S,Oe).call(this,t,r,s,"GET")))();const a=this.getPath(t,{env:s}),o=this.router.match(n,a),i=new Wt(t,{path:a,matchResult:o,env:s,executionCtx:r,notFoundHandler:u(this,H)});if(o[0].length===1){let d;try{d=o[0][0][0][0](i,async()=>{i.res=await u(this,H).call(this,i)})}catch(l){return v(this,S,xe).call(this,l,i)}return d instanceof Promise?d.then(l=>l||(i.finalized?i.res:u(this,H).call(this,i))).catch(l=>v(this,S,xe).call(this,l,i)):d??u(this,H).call(this,i)}const c=Ye(o[0],this.errorHandler,u(this,H));return(async()=>{try{const d=await c(i);if(!d.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return d.res}catch(d){return v(this,S,xe).call(this,d,i)}})()},Ee),ht=[];function zt(e,t){const r=this.buildAllMatchers(),s=((n,a)=>{const o=r[n]||r[I],i=o[2][a];if(i)return i;const c=a.match(o[0]);if(!c)return[[],ht];const d=c.indexOf("",1);return[o[1][d],c]});return this.match=s,s(e,t)}var Ne="[^/]+",ve=".*",Te="(?:|/.*)",me=Symbol(),Jt=new Set(".\\+*[^]$()");function Xt(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===ve||e===Te?1:t===ve||t===Te?-1:e===Ne?1:t===Ne?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var ne,ae,F,ce,Qt=(ce=class{constructor(){w(this,ne);w(this,ae);w(this,F,Object.create(null))}insert(t,r,s,n,a){if(t.length===0){if(u(this,ne)!==void 0)throw me;if(a)return;g(this,ne,r);return}const[o,...i]=t,c=o==="*"?i.length===0?["","",ve]:["","",Ne]:o==="/*"?["","",Te]:o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let d;if(c){const l=c[1];let p=c[2]||Ne;if(l&&c[2]&&(p===".*"||(p=p.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(p))))throw me;if(d=u(this,F)[p],!d){if(Object.keys(u(this,F)).some(m=>m!==ve&&m!==Te))throw me;if(a)return;d=u(this,F)[p]=new ce,l!==""&&g(d,ae,n.varIndex++)}!a&&l!==""&&s.push([l,u(d,ae)])}else if(d=u(this,F)[o],!d){if(Object.keys(u(this,F)).some(l=>l.length>1&&l!==ve&&l!==Te))throw me;if(a)return;d=u(this,F)[o]=new ce}d.insert(i,r,s,n,a)}buildRegExpStr(){const r=Object.keys(u(this,F)).sort(Xt).map(s=>{const n=u(this,F)[s];return(typeof u(n,ae)=="number"?`(${s})@${u(n,ae)}`:Jt.has(s)?`\\${s}`:s)+n.buildRegExpStr()});return typeof u(this,ne)=="number"&&r.unshift(`#${u(this,ne)}`),r.length===0?"":r.length===1?r[0]:"(?:"+r.join("|")+")"}},ne=new WeakMap,ae=new WeakMap,F=new WeakMap,ce),Pe,Ae,Ze,Zt=(Ze=class{constructor(){w(this,Pe,{varIndex:0});w(this,Ae,new Qt)}insert(e,t,r){const s=[],n=[];for(let o=0;;){let i=!1;if(e=e.replace(/\{[^}]+\}/g,c=>{const d=`@\\${o}`;return n[o]=[d,c],o++,i=!0,d}),!i)break}const a=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let o=n.length-1;o>=0;o--){const[i]=n[o];for(let c=a.length-1;c>=0;c--)if(a[c].indexOf(i)!==-1){a[c]=a[c].replace(i,n[o][1]);break}}return u(this,Ae).insert(a,t,s,u(this,Pe),r),s}buildRegExp(){let e=u(this,Ae).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const r=[],s=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(n,a,o)=>a!==void 0?(r[++t]=Number(a),"$()"):(o!==void 0&&(s[Number(o)]=++t),"")),[new RegExp(`^${e}`),r,s]}},Pe=new WeakMap,Ae=new WeakMap,Ze),er=[/^$/,[],Object.create(null)],Ce=Object.create(null);function gt(e){return Ce[e]??(Ce[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,r)=>r?`\\${r}`:"(?:|/.*)")}$`))}function tr(){Ce=Object.create(null)}function rr(e){var d;const t=new Zt,r=[];if(e.length===0)return er;const s=e.map(l=>[!/\*|\/:/.test(l[0]),...l]).sort(([l,p],[m,h])=>l?1:m?-1:p.length-h.length),n=Object.create(null);for(let l=0,p=-1,m=s.length;l<m;l++){const[h,b,y]=s[l];h?n[b]=[y.map(([T])=>[T,Object.create(null)]),ht]:p++;let E;try{E=t.insert(b,p,h)}catch(T){throw T===me?new mt(b):T}h||(r[p]=y.map(([T,x])=>{const D=Object.create(null);for(x-=1;x>=0;x--){const[N,R]=E[x];D[N]=R}return[T,D]}))}const[a,o,i]=t.buildRegExp();for(let l=0,p=r.length;l<p;l++)for(let m=0,h=r[l].length;m<h;m++){const b=(d=r[l][m])==null?void 0:d[1];if(!b)continue;const y=Object.keys(b);for(let E=0,T=y.length;E<T;E++)b[y[E]]=i[b[y[E]]]}const c=[];for(const l in o)c[l]=r[o[l]];return[a,c,n]}function le(e,t){if(e){for(const r of Object.keys(e).sort((s,n)=>n.length-s.length))if(gt(r).test(t))return[...e[r]]}}var z,J,Ue,_t,et,sr=(et=class{constructor(){w(this,Ue);_(this,"name","RegExpRouter");w(this,z);w(this,J);_(this,"match",zt);g(this,z,{[I]:Object.create(null)}),g(this,J,{[I]:Object.create(null)})}add(e,t,r){var i;const s=u(this,z),n=u(this,J);if(!s||!n)throw new Error(pt);s[e]||[s,n].forEach(c=>{c[e]=Object.create(null),Object.keys(c[I]).forEach(d=>{c[e][d]=[...c[I][d]]})}),t==="/*"&&(t="*");const a=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const c=gt(t);e===I?Object.keys(s).forEach(d=>{var l;(l=s[d])[t]||(l[t]=le(s[d],t)||le(s[I],t)||[])}):(i=s[e])[t]||(i[t]=le(s[e],t)||le(s[I],t)||[]),Object.keys(s).forEach(d=>{(e===I||e===d)&&Object.keys(s[d]).forEach(l=>{c.test(l)&&s[d][l].push([r,a])})}),Object.keys(n).forEach(d=>{(e===I||e===d)&&Object.keys(n[d]).forEach(l=>c.test(l)&&n[d][l].push([r,a]))});return}const o=at(t)||[t];for(let c=0,d=o.length;c<d;c++){const l=o[c];Object.keys(n).forEach(p=>{var m;(e===I||e===p)&&((m=n[p])[l]||(m[l]=[...le(s[p],l)||le(s[I],l)||[]]),n[p][l].push([r,a-d+c+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(u(this,J)).concat(Object.keys(u(this,z))).forEach(t=>{e[t]||(e[t]=v(this,Ue,_t).call(this,t))}),g(this,z,g(this,J,void 0)),tr(),e}},z=new WeakMap,J=new WeakMap,Ue=new WeakSet,_t=function(e){const t=[];let r=e===I;return[u(this,z),u(this,J)].forEach(s=>{const n=s[e]?Object.keys(s[e]).map(a=>[a,s[e][a]]):[];n.length!==0?(r||(r=!0),t.push(...n)):e!==I&&t.push(...Object.keys(s[I]).map(a=>[a,s[I][a]]))}),r?rr(t):null},et),X,q,tt,nr=(tt=class{constructor(e){_(this,"name","SmartRouter");w(this,X,[]);w(this,q,[]);g(this,X,e.routers)}add(e,t,r){if(!u(this,q))throw new Error(pt);u(this,q).push([e,t,r])}match(e,t){if(!u(this,q))throw new Error("Fatal error");const r=u(this,X),s=u(this,q),n=r.length;let a=0,o;for(;a<n;a++){const i=r[a];try{for(let c=0,d=s.length;c<d;c++)i.add(...s[c]);o=i.match(e,t)}catch(c){if(c instanceof mt)continue;throw c}this.match=i.match.bind(i),g(this,X,[i]),g(this,q,void 0);break}if(a===n)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,o}get activeRouter(){if(u(this,q)||u(this,X).length!==1)throw new Error("No active router has been determined yet.");return u(this,X)[0]}},X=new WeakMap,q=new WeakMap,tt),be=Object.create(null),Q,k,oe,ye,j,V,re,we,ar=(we=class{constructor(t,r,s){w(this,V);w(this,Q);w(this,k);w(this,oe);w(this,ye,0);w(this,j,be);if(g(this,k,s||Object.create(null)),g(this,Q,[]),t&&r){const n=Object.create(null);n[t]={handler:r,possibleKeys:[],score:0},g(this,Q,[n])}g(this,oe,[])}insert(t,r,s){g(this,ye,++Ve(this,ye)._);let n=this;const a=Ct(r),o=[];for(let i=0,c=a.length;i<c;i++){const d=a[i],l=a[i+1],p=Ut(d,l),m=Array.isArray(p)?p[0]:d;if(m in u(n,k)){n=u(n,k)[m],p&&o.push(p[1]);continue}u(n,k)[m]=new we,p&&(u(n,oe).push(p),o.push(p[1])),n=u(n,k)[m]}return u(n,Q).push({[t]:{handler:s,possibleKeys:o.filter((i,c,d)=>d.indexOf(i)===c),score:u(this,ye)}}),n}search(t,r){var c;const s=[];g(this,j,be);let a=[this];const o=st(r),i=[];for(let d=0,l=o.length;d<l;d++){const p=o[d],m=d===l-1,h=[];for(let b=0,y=a.length;b<y;b++){const E=a[b],T=u(E,k)[p];T&&(g(T,j,u(E,j)),m?(u(T,k)["*"]&&s.push(...v(this,V,re).call(this,u(T,k)["*"],t,u(E,j))),s.push(...v(this,V,re).call(this,T,t,u(E,j)))):h.push(T));for(let x=0,D=u(E,oe).length;x<D;x++){const N=u(E,oe)[x],R=u(E,j)===be?{}:{...u(E,j)};if(N==="*"){const A=u(E,k)["*"];A&&(s.push(...v(this,V,re).call(this,A,t,u(E,j))),g(A,j,R),h.push(A));continue}const[Z,ee,P]=N;if(!p&&!(P instanceof RegExp))continue;const C=u(E,k)[Z],U=o.slice(d).join("/");if(P instanceof RegExp){const A=P.exec(U);if(A){if(R[ee]=A[0],s.push(...v(this,V,re).call(this,C,t,u(E,j),R)),Object.keys(u(C,k)).length){g(C,j,R);const B=((c=A[0].match(/\//))==null?void 0:c.length)??0;(i[B]||(i[B]=[])).push(C)}continue}}(P===!0||P.test(p))&&(R[ee]=p,m?(s.push(...v(this,V,re).call(this,C,t,R,u(E,j))),u(C,k)["*"]&&s.push(...v(this,V,re).call(this,u(C,k)["*"],t,R,u(E,j)))):(g(C,j,R),h.push(C)))}}a=h.concat(i.shift()??[])}return s.length>1&&s.sort((d,l)=>d.score-l.score),[s.map(({handler:d,params:l})=>[d,l])]}},Q=new WeakMap,k=new WeakMap,oe=new WeakMap,ye=new WeakMap,j=new WeakMap,V=new WeakSet,re=function(t,r,s,n){const a=[];for(let o=0,i=u(t,Q).length;o<i;o++){const c=u(t,Q)[o],d=c[r]||c[I],l={};if(d!==void 0&&(d.params=Object.create(null),a.push(d),s!==be||n&&n!==be))for(let p=0,m=d.possibleKeys.length;p<m;p++){const h=d.possibleKeys[p],b=l[d.score];d.params[h]=n!=null&&n[h]&&!b?n[h]:s[h]??(n==null?void 0:n[h]),l[d.score]=!0}}return a},we),ie,rt,or=(rt=class{constructor(){_(this,"name","TrieRouter");w(this,ie);g(this,ie,new ar)}add(e,t,r){const s=at(t);if(s){for(let n=0,a=s.length;n<a;n++)u(this,ie).insert(e,s[n],r);return}u(this,ie).insert(e,t,r)}match(e,t){return u(this,ie).search(e,t)}},ie=new WeakMap,rt),Et=class extends Gt{constructor(e={}){super(e),this.router=e.router??new nr({routers:[new sr,new or]})}},ir=e=>{const r={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},s=(a=>typeof a=="string"?a==="*"?()=>a:o=>a===o?o:null:typeof a=="function"?a:o=>a.includes(o)?o:null)(r.origin),n=(a=>typeof a=="function"?a:Array.isArray(a)?()=>a:()=>[])(r.allowMethods);return async function(o,i){var l;function c(p,m){o.res.headers.set(p,m)}const d=await s(o.req.header("origin")||"",o);if(d&&c("Access-Control-Allow-Origin",d),r.credentials&&c("Access-Control-Allow-Credentials","true"),(l=r.exposeHeaders)!=null&&l.length&&c("Access-Control-Expose-Headers",r.exposeHeaders.join(",")),o.req.method==="OPTIONS"){r.origin!=="*"&&c("Vary","Origin"),r.maxAge!=null&&c("Access-Control-Max-Age",r.maxAge.toString());const p=await n(o.req.header("origin")||"",o);p.length&&c("Access-Control-Allow-Methods",p.join(","));let m=r.allowHeaders;if(!(m!=null&&m.length)){const h=o.req.header("Access-Control-Request-Headers");h&&(m=h.split(/\s*,\s*/))}return m!=null&&m.length&&(c("Access-Control-Allow-Headers",m.join(",")),o.res.headers.append("Vary","Access-Control-Request-Headers")),o.res.headers.delete("Content-Length"),o.res.headers.delete("Content-Type"),new Response(null,{headers:o.res.headers,status:204,statusText:"No Content"})}await i(),r.origin!=="*"&&o.header("Vary","Origin",{append:!0})}},cr=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,ze=(e,t=lr)=>{const r=/\.([a-zA-Z0-9]+?)$/,s=e.match(r);if(!s)return;let n=t[s[1]];return n&&n.startsWith("text")&&(n+="; charset=utf-8"),n},dr={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},lr=dr,ur=(...e)=>{let t=e.filter(n=>n!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const r=t.split("/"),s=[];for(const n of r)n===".."&&s.length>0&&s.at(-1)!==".."?s.pop():n!=="."&&s.push(n);return s.join("/")||"."},yt={br:".br",zstd:".zst",gzip:".gz"},pr=Object.keys(yt),mr="index.html",fr=e=>{const t=e.root??"./",r=e.path,s=e.join??ur;return async(n,a)=>{var l,p,m,h;if(n.finalized)return a();let o;if(e.path)o=e.path;else try{if(o=decodeURIComponent(n.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(o))throw new Error}catch{return await((l=e.onNotFound)==null?void 0:l.call(e,n.req.path,n)),a()}let i=s(t,!r&&e.rewriteRequestPath?e.rewriteRequestPath(o):o);e.isDir&&await e.isDir(i)&&(i=s(i,mr));const c=e.getContent;let d=await c(i,n);if(d instanceof Response)return n.newResponse(d.body,d);if(d){const b=e.mimes&&ze(i,e.mimes)||ze(i);if(n.header("Content-Type",b||"application/octet-stream"),e.precompressed&&(!b||cr.test(b))){const y=new Set((p=n.req.header("Accept-Encoding"))==null?void 0:p.split(",").map(E=>E.trim()));for(const E of pr){if(!y.has(E))continue;const T=await c(i+yt[E],n);if(T){d=T,n.header("Content-Encoding",E),n.header("Vary","Accept-Encoding",{append:!0});break}}}return await((m=e.onFound)==null?void 0:m.call(e,i,n)),n.body(d)}await((h=e.onNotFound)==null?void 0:h.call(e,i,n)),await a()}},hr=async(e,t)=>{let r;t&&t.manifest?typeof t.manifest=="string"?r=JSON.parse(t.manifest):r=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?r=JSON.parse(__STATIC_CONTENT_MANIFEST):r=__STATIC_CONTENT_MANIFEST;let s;t&&t.namespace?s=t.namespace:s=__STATIC_CONTENT;const n=r[e]||e;if(!n)return null;const a=await s.get(n,{type:"stream"});return a||null},gr=e=>async function(r,s){return fr({...e,getContent:async a=>hr(a,{manifest:e.manifest,namespace:e.namespace?e.namespace:r.env?r.env.__STATIC_CONTENT:void 0})})(r,s)},_r=e=>gr(e);async function Er(e,t,r,s,n){const a={typ:"JWT",alg:"HS256",cty:"twilio-fpa;v=1"},o=Math.floor(Date.now()/1e3),i=o+3600,c={room:n},d={jti:`${t}-${o}`,iss:t,sub:e,exp:i,grants:{identity:s,video:c}},l=N=>{const R=JSON.stringify(N);return btoa(R).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")},p=l(a),m=l(d),h=`${p}.${m}`,b=new TextEncoder,y=b.encode(r),E=await crypto.subtle.importKey("raw",y,{name:"HMAC",hash:"SHA-256"},!1,["sign"]),T=await crypto.subtle.sign("HMAC",E,b.encode(h)),x=new Uint8Array(T);let D=btoa(String.fromCharCode(...x));return D=D.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),`${h}.${D}`}const f=new Et;f.use("/api/*",ir());f.use("/static/*",_r({root:"./public"}));async function wt(e,t,r,s,n){try{const a=`${r}/verify-email?token=${t}`,o=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${s}`,"Content-Type":"application/json"},body:JSON.stringify({from:`Amebo <${n}>`,to:e,subject:"Verify your Amebo account",html:`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Welcome to Amebo! 🚀</h2>
            <p>Thank you for signing up! Please verify your email address to activate your account and start earning tokens.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${a}" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
              Verify Email Address
            </a>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #7c3aed; word-break: break-all;">${a}</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
          </div>
        `})});if(!o.ok){const i=await o.text();return console.error("[EMAIL] Resend API error:",i),!1}return console.log("[EMAIL] Verification email sent to:",e),!0}catch(a){return console.error("[EMAIL] Send error:",a),!1}}f.post("/api/auth/register-email",async e=>{try{const{email:t,password:r}=await e.req.json();if(!t||!r)return e.json({error:"Email and password required"},400);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t))return e.json({error:"Invalid email format"},400);if(await e.env.DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(t).first())return e.json({error:"Email already registered"},409);const a=crypto.randomUUID(),o=crypto.randomUUID(),i=new Date(Date.now()+1440*60*1e3),c=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(r)),d=Array.from(new Uint8Array(c)).map(h=>h.toString(16).padStart(2,"0")).join("");await e.env.DB.prepare(`
      INSERT INTO users (
        id, username, email, public_key, email_verified, 
        verification_token, verification_expires, country_code, tokens
      ) VALUES (?, ?, ?, ?, 0, ?, ?, 'NG', 0)
    `).bind(a,t.split("@")[0],t,d,o,i.toISOString()).run();const l=e.env.APP_URL||"http://localhost:3000",p=e.env.RESEND_API_KEY||"",m=e.env.FROM_EMAIL||"onboarding@resend.dev";return p?await wt(t,o,l,p,m):console.log("[EMAIL] Verification link (RESEND_API_KEY not set):",`${l}/verify-email?token=${o}`),console.log(`[AUTH] User registered: ${t} (verification pending)`),e.json({success:!0,userId:a,email:t,message:"Registration successful! Please check your email to verify your account.",verificationRequired:!0})}catch(t){return console.error("[AUTH] Registration error:",t),e.json({error:"Registration failed"},500)}});f.get("/api/auth/verify-email/:token",async e=>{try{const t=e.req.param("token"),r=await e.env.DB.prepare(`
      SELECT id, email, verification_expires FROM users 
      WHERE verification_token = ? AND email_verified = 0
    `).bind(t).first();return r?new Date(r.verification_expires)<new Date?e.json({error:"Verification link has expired"},400):(await e.env.DB.prepare(`
      UPDATE users 
      SET email_verified = 1, 
          verification_token = NULL,
          tokens = tokens + 20
      WHERE id = ?
    `).bind(r.id).run(),await e.env.DB.prepare(`
      INSERT INTO token_earnings (user_id, action, amount, tier)
      VALUES (?, 'email_verified', 20, 'bronze')
    `).bind(r.id).run(),console.log(`[AUTH] Email verified: ${r.email} (+20 tokens bonus)`),e.json({success:!0,message:"Email verified successfully! You earned 20 tokens!",userId:r.id})):e.json({error:"Invalid or expired verification link"},400)}catch(t){return console.error("[AUTH] Verification error:",t),e.json({error:"Verification failed"},500)}});f.post("/api/auth/login-email",async e=>{try{const{email:t,password:r}=await e.req.json();if(!t||!r)return e.json({error:"Email and password required"},400);const s=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(r)),n=Array.from(new Uint8Array(s)).map(o=>o.toString(16).padStart(2,"0")).join(""),a=await e.env.DB.prepare(`
      SELECT id, username, email, email_verified, tokens, token_tier, created_at 
      FROM users 
      WHERE email = ? AND public_key = ?
    `).bind(t,n).first();return a?a.email_verified?(console.log(`[AUTH] User logged in: ${t}`),e.json({success:!0,user:{id:a.id,username:a.username,email:a.email,tokens:a.tokens||0,tier:a.token_tier||"bronze",emailVerified:a.email_verified===1}})):e.json({error:"Please verify your email first",verificationRequired:!0},403):e.json({error:"Invalid email or password"},401)}catch(t){return console.error("[AUTH] Login error:",t),e.json({error:"Login failed"},500)}});f.post("/api/auth/resend-verification",async e=>{try{const{email:t}=await e.req.json(),r=await e.env.DB.prepare(`
      SELECT id, email, email_verified FROM users WHERE email = ?
    `).bind(t).first();if(!r)return e.json({error:"Email not found"},404);if(r.email_verified===1)return e.json({error:"Email already verified"},400);const s=crypto.randomUUID(),n=new Date(Date.now()+1440*60*1e3);await e.env.DB.prepare(`
      UPDATE users 
      SET verification_token = ?, verification_expires = ?
      WHERE id = ?
    `).bind(s,n.toISOString(),r.id).run();const a=e.env.APP_URL||"http://localhost:3000",o=e.env.RESEND_API_KEY||"",i=e.env.FROM_EMAIL||"onboarding@resend.dev";return o&&await wt(t,s,a,o,i),e.json({success:!0,message:"Verification email sent"})}catch(t){return console.error("[AUTH] Resend error:",t),e.json({error:"Failed to resend verification"},500)}});f.post("/api/auth/forgot-password",async e=>{try{const{email:t}=await e.req.json();if(!t)return e.json({error:"Email required"},400);const r=await e.env.DB.prepare(`
      SELECT id, email FROM users WHERE email = ?
    `).bind(t).first();if(!r)return e.json({success:!0,message:"If an account with that email exists, a password reset link has been sent."});const s=new Date(Date.now()-3600*1e3).toISOString();if(r.last_password_reset&&r.last_password_reset>s&&r.password_reset_attempts>=5)return e.json({error:"Too many password reset attempts. Please try again in 1 hour."},429);const n=crypto.randomUUID(),a=new Date(Date.now()+3600*1e3);await e.env.DB.prepare(`
      UPDATE users 
      SET password_reset_token = ?,
          password_reset_expires = ?,
          password_reset_attempts = password_reset_attempts + 1,
          last_password_reset = ?
      WHERE id = ?
    `).bind(n,a.toISOString(),new Date().toISOString(),r.id).run();const o=e.env.APP_URL||"http://localhost:3000",i=e.env.RESEND_API_KEY||"",c=e.env.FROM_EMAIL||"onboarding@resend.dev";if(i)try{const d=`${o}/reset-password?token=${n}`,l=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"},body:JSON.stringify({from:`Amebo <${c}>`,to:t,subject:"Reset your Amebo password",html:`
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7c3aed;">Password Reset Request 🔐</h2>
                <p>We received a request to reset your Amebo password.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${d}" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                  Reset Password
                </a>
                <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <p style="color: #7c3aed; word-break: break-all;">${d}</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
            `})});if(l.ok)console.log("[EMAIL] Password reset email sent to:",t);else{const p=await l.json();console.error("[EMAIL] Resend API error:",p)}}catch(d){console.error("[EMAIL] Failed to send password reset email:",d)}else console.log("[EMAIL] Password reset link (RESEND_API_KEY not set):",`${o}/reset-password?token=${n}`);return e.json({success:!0,message:"If an account with that email exists, a password reset link has been sent."})}catch(t){return console.error("[AUTH] Forgot password error:",t),e.json({error:"Failed to process password reset request",message:t.message},500)}});f.post("/api/auth/reset-password",async e=>{try{const{token:t,newPassword:r}=await e.req.json();if(!t||!r)return e.json({error:"Token and new password required"},400);if(r.length<8)return e.json({error:"Password must be at least 8 characters long"},400);if(!/[A-Z]/.test(r))return e.json({error:"Password must contain at least one uppercase letter"},400);if(!/[0-9]/.test(r))return e.json({error:"Password must contain at least one number"},400);const s=await e.env.DB.prepare(`
      SELECT id, email, password_reset_expires FROM users 
      WHERE password_reset_token = ?
    `).bind(t).first();if(!s)return e.json({error:"Invalid or expired reset token"},400);const n=new Date,a=new Date(s.password_reset_expires);if(n>a)return e.json({error:"Reset token has expired. Please request a new one."},400);const o=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(r)),i=Array.from(new Uint8Array(o)).map(c=>c.toString(16).padStart(2,"0")).join("");return await e.env.DB.prepare(`
      UPDATE users 
      SET public_key = ?,
          password_reset_token = NULL,
          password_reset_expires = NULL,
          password_reset_attempts = 0
      WHERE id = ?
    `).bind(i,s.id).run(),console.log("[AUTH] Password reset successful for:",s.email),e.json({success:!0,message:"Password reset successfully. You can now login with your new password."})}catch(t){return console.error("[AUTH] Reset password error:",t),e.json({error:"Failed to reset password",message:t.message},500)}});f.post("/api/auth/register",async e=>{var t;try{const{username:r,publicKey:s}=await e.req.json();if(!r||!s)return e.json({error:"Username and public key required"},400);const n=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO users (id, username, public_key) VALUES (?, ?, ?)
    `).bind(n,r,s).run(),e.json({success:!0,userId:n,username:r,message:"User registered successfully"})}catch(r){return(t=r.message)!=null&&t.includes("UNIQUE constraint failed")?e.json({error:"Username already exists"},409):e.json({error:"Registration failed"},500)}});f.post("/api/auth/login",async e=>{try{const{username:t}=await e.req.json(),r=await e.env.DB.prepare(`
      SELECT id, username, public_key, created_at FROM users WHERE username = ?
    `).bind(t).first();return r?e.json({success:!0,user:r}):e.json({error:"User not found"},404)}catch{return e.json({error:"Login failed"},500)}});f.get("/api/users/:userId",async e=>{try{const t=e.req.param("userId"),r=await e.env.DB.prepare(`
      SELECT id, username, public_key, created_at FROM users WHERE id = ?
    `).bind(t).first();return r?e.json({success:!0,user:r}):e.json({error:"User not found"},404)}catch{return e.json({error:"Failed to fetch user"},500)}});f.post("/api/users/update-avatar",async e=>{try{const{userId:t,avatar:r}=await e.req.json();return t?(await e.env.DB.prepare(`
      UPDATE users SET avatar = ? WHERE id = ?
    `).bind(r,t).run(),e.json({success:!0,message:"Avatar updated"})):e.json({error:"User ID required"},400)}catch(t){return console.error("Avatar update error:",t),e.json({error:"Failed to update avatar"},500)}});f.post("/api/users/update-username",async e=>{try{const{userId:t,username:r}=await e.req.json();return!t||!r?e.json({error:"User ID and username required"},400):await e.env.DB.prepare(`
      SELECT id FROM users WHERE username = ? AND id != ?
    `).bind(r,t).first()?e.json({error:"Username already taken"},409):(await e.env.DB.prepare(`
      UPDATE users SET username = ? WHERE id = ?
    `).bind(r,t).run(),e.json({success:!0,message:"Username updated"}))}catch(t){return console.error("Username update error:",t),e.json({error:"Failed to update username"},500)}});f.post("/api/users/update-password",async e=>{try{const{userId:t,email:r,currentPassword:s,newPassword:n}=await e.req.json();if(!t||!s||!n)return e.json({error:"All fields required"},400);const a=await e.env.DB.prepare(`
      SELECT password_hash FROM users WHERE id = ? AND email = ?
    `).bind(t,r).first();if(!a)return e.json({error:"User not found"},404);if(!await bcrypt.compare(s,a.password_hash))return e.json({error:"Current password is incorrect"},401);const i=await bcrypt.hash(n,10);return await e.env.DB.prepare(`
      UPDATE users SET password_hash = ? WHERE id = ?
    `).bind(i,t).run(),e.json({success:!0,message:"Password updated"})}catch(t){return console.error("Password update error:",t),e.json({error:"Failed to update password"},500)}});f.post("/api/rooms/create",async e=>{var t;try{const{roomCode:r,roomName:s,userId:n}=await e.req.json();if(!r||!n)return e.json({error:"Room code and user ID required"},400);const a=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO chat_rooms (id, room_code, room_name, created_by) VALUES (?, ?, ?, ?)
    `).bind(a,r,s||"Private Chat",n).run(),await e.env.DB.prepare(`
      INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
    `).bind(a,n).run(),e.json({success:!0,roomId:a,roomCode:r,message:"Room created successfully"})}catch(r){return(t=r.message)!=null&&t.includes("UNIQUE constraint failed")?e.json({error:"Room code already exists"},409):e.json({error:"Failed to create room"},500)}});f.post("/api/rooms/join",async e=>{try{const{roomCode:t,userId:r}=await e.req.json();if(!t||!r)return e.json({error:"Room code and user ID required"},400);const s=await e.env.DB.prepare(`
      SELECT id, room_code, room_name FROM chat_rooms WHERE room_code = ?
    `).bind(t).first();return s?(await e.env.DB.prepare(`
      SELECT * FROM room_members WHERE room_id = ? AND user_id = ?
    `).bind(s.id,r).first()||await e.env.DB.prepare(`
        INSERT INTO room_members (room_id, user_id) VALUES (?, ?)
      `).bind(s.id,r).run(),e.json({success:!0,room:s,message:"Joined room successfully"})):e.json({error:"Room not found"},404)}catch{return e.json({error:"Failed to join room"},500)}});f.get("/api/rooms/user/:userId",async e=>{try{const t=e.req.param("userId"),r=await e.env.DB.prepare(`
      SELECT cr.id, cr.room_code, cr.room_name, cr.created_at,
             (SELECT COUNT(*) FROM room_members WHERE room_id = cr.id) as member_count
      FROM chat_rooms cr
      JOIN room_members rm ON cr.id = rm.room_id
      WHERE rm.user_id = ?
      ORDER BY cr.created_at DESC
    `).bind(t).all();return e.json({success:!0,rooms:r.results||[]})}catch{return e.json({error:"Failed to fetch rooms"},500)}});f.get("/api/rooms/:roomId/members",async e=>{try{const t=e.req.param("roomId"),r=await e.env.DB.prepare(`
      SELECT u.id, u.username, u.public_key, rm.joined_at
      FROM users u
      JOIN room_members rm ON u.id = rm.user_id
      WHERE rm.room_id = ?
      ORDER BY rm.joined_at ASC
    `).bind(t).all();return e.json({success:!0,members:r.results||[]})}catch{return e.json({error:"Failed to fetch members"},500)}});f.post("/api/messages/send",async e=>{try{const{roomId:t,senderId:r,encryptedContent:s,iv:n}=await e.req.json();if(!t||!r||!s||!n)return e.json({error:"All fields required"},400);if(!await e.env.DB.prepare(`
      SELECT * FROM room_members WHERE room_id = ? AND user_id = ?
    `).bind(t,r).first())return e.json({error:"Not a member of this room"},403);const o=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO messages (id, room_id, sender_id, encrypted_content, iv) 
      VALUES (?, ?, ?, ?, ?)
    `).bind(o,t,r,s,n).run();try{const i=await e.env.DB.prepare(`
        SELECT username FROM users WHERE id = ?
      `).bind(r).first(),c=await e.env.DB.prepare(`
        SELECT room_name, room_code FROM rooms WHERE id = ?
      `).bind(t).first(),{results:d}=await e.env.DB.prepare(`
        SELECT user_id FROM room_members WHERE room_id = ? AND user_id != ?
      `).bind(t,r).all(),l=(c==null?void 0:c.room_name)||(c==null?void 0:c.room_code)||"Unknown Room",p=(i==null?void 0:i.username)||"Someone";for(const m of d||[]){const h=crypto.randomUUID();await e.env.DB.prepare(`
          INSERT INTO notifications (id, user_id, type, title, message, data, is_read)
          VALUES (?, ?, ?, ?, ?, ?, 0)
        `).bind(h,m.user_id,"new_message",`New message in ${l}`,`${p} sent a message`,JSON.stringify({roomId:t,messageId:o,senderId:r,roomName:l})).run(),console.log(`[NOTIFICATION] Created for user ${m.user_id} in room ${l}`)}}catch(i){console.error("[NOTIFICATION] Error creating notifications:",i)}return e.json({success:!0,messageId:o,message:"Message sent successfully"})}catch{return e.json({error:"Failed to send message"},500)}});f.get("/api/messages/:roomId",async e=>{try{const t=e.req.param("roomId"),r=parseInt(e.req.query("limit")||"50"),s=parseInt(e.req.query("offset")||"0"),n=await e.env.DB.prepare(`
      SELECT m.id, m.room_id, m.sender_id, m.encrypted_content, m.iv, m.created_at,
             u.username, u.public_key
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(t,r,s).all();return e.json({success:!0,messages:(n.results||[]).reverse()})}catch{return e.json({error:"Failed to fetch messages"},500)}});f.post("/api/twilio/token",async e=>{try{const{roomCode:t,userName:r}=await e.req.json();if(!t||!r)return e.json({error:"Room code and user name required"},400);const s=e.env.TWILIO_ACCOUNT_SID,n=e.env.TWILIO_API_KEY,a=e.env.TWILIO_API_SECRET;if(!s||!n||!a)return e.json({error:"Twilio credentials not configured",message:"Please configure TWILIO_ACCOUNT_SID, TWILIO_API_KEY, and TWILIO_API_SECRET in environment variables. See TWILIO_SETUP_GUIDE.md for details."},503);const o=r,i=t,c=await Er(s,n,a,o,i);return e.json({success:!0,token:c,identity:o,roomName:i,message:"Access token generated successfully"})}catch(t){return console.error("Twilio token generation error:",t),e.json({error:"Failed to generate access token",details:t.message},500)}});f.post("/api/notifications/subscribe",async e=>{try{const{userId:t,subscription:r}=await e.req.json();return!t||!r?e.json({error:"User ID and subscription required"},400):(await e.env.DB.prepare(`
      INSERT OR REPLACE INTO push_subscriptions (user_id, subscription_data, created_at)
      VALUES (?, ?, datetime('now'))
    `).bind(t,JSON.stringify(r)).run(),e.json({success:!0,message:"Push subscription saved successfully"}))}catch{return e.json({error:"Failed to save subscription"},500)}});f.post("/api/notifications/send",async e=>{try{const{userId:t,title:r,body:s,data:n}=await e.req.json();if(!t||!r)return e.json({error:"User ID and title required"},400);const a=await e.env.DB.prepare(`
      SELECT subscription_data FROM push_subscriptions WHERE user_id = ?
    `).bind(t).first();if(!a)return e.json({error:"No push subscription found for user"},404);const o=JSON.parse(a.subscription_data);return e.json({success:!0,message:"Notification sent successfully",note:"Implement actual Web Push in production"})}catch{return e.json({error:"Failed to send notification"},500)}});f.post("/api/payments/naira/initialize",async e=>{try{const{userId:t,email:r,amount:s,reference:n}=await e.req.json();if(!t||!r||!s)return e.json({error:"User ID, email, and amount required"},400);const a=n||`NGN-${Date.now()}-${crypto.randomUUID().slice(0,8)}`,o=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO transactions (id, user_id, type, currency, amount, reference, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(o,t,"send","NGN",s.toString(),a,"pending",JSON.stringify({email:r})).run();const i=e.env.PAYSTACK_SECRET_KEY;if(i&&i!=="your_key_here")try{const d=await(await fetch("https://api.paystack.co/transaction/initialize",{method:"POST",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"},body:JSON.stringify({email:r,amount:Math.round(s*100),reference:a,callback_url:`${new URL(e.req.url).origin}/api/payments/naira/verify/${a}`})})).json();if(d.status)return e.json({success:!0,reference:a,authorizationUrl:d.data.authorization_url,accessCode:d.data.access_code,message:"Payment initialized. Redirecting to Paystack..."});throw new Error(d.message||"Paystack initialization failed")}catch(c){return console.error("Paystack API error:",c),e.json({error:"Payment initialization failed",details:c.message,note:"Please check your Paystack API key"},500)}else return e.json({success:!0,reference:a,authorizationUrl:`https://checkout.paystack.com/demo/${a}`,message:"⚠️ DEMO MODE: Add PAYSTACK_SECRET_KEY to use real payments. Get your key at https://paystack.com",demo:!0})}catch{return e.json({error:"Failed to initialize payment"},500)}});f.get("/api/payments/naira/verify/:reference",async e=>{var t;try{const r=e.req.param("reference"),s=await e.env.DB.prepare(`
      SELECT * FROM transactions WHERE reference = ?
    `).bind(r).first();if(!s)return e.json({error:"Transaction not found"},404);const n=e.env.PAYSTACK_SECRET_KEY;if(n&&n!=="your_key_here")try{const o=await(await fetch(`https://api.paystack.co/transaction/verify/${r}`,{method:"GET",headers:{Authorization:`Bearer ${n}`}})).json();if(o.status&&o.data.status==="success")return await e.env.DB.prepare(`
            UPDATE transactions SET status = ? WHERE reference = ?
          `).bind("completed",r).run(),e.json({success:!0,status:"completed",amount:o.data.amount/100,currency:o.data.currency,paidAt:o.data.paid_at,channel:o.data.channel});{const i=((t=o.data)==null?void 0:t.status)||"failed";return await e.env.DB.prepare(`
            UPDATE transactions SET status = ? WHERE reference = ?
          `).bind(i,r).run(),e.json({success:!1,status:i,message:o.message||"Payment verification failed"})}}catch(a){return console.error("Paystack verification error:",a),e.json({error:"Verification failed",details:a.message},500)}else return await e.env.DB.prepare(`
        UPDATE transactions SET status = ? WHERE reference = ?
      `).bind("completed",r).run(),e.json({success:!0,status:"completed",amount:s.amount,currency:s.currency,demo:!0,message:"⚠️ DEMO MODE: Transaction auto-completed. Add PAYSTACK_SECRET_KEY for real verification."})}catch{return e.json({error:"Failed to verify payment"},500)}});f.get("/api/transactions/:userId",async e=>{try{const t=e.req.param("userId"),r=parseInt(e.req.query("limit")||"50"),s=await e.env.DB.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind(t,r).all();return e.json({success:!0,transactions:s.results||[]})}catch{return e.json({error:"Failed to fetch transactions"},500)}});f.get("/api/crypto/bitcoin/:address",async e=>{try{const t=e.req.param("address");try{const r=await fetch(`https://blockchain.info/q/addressbalance/${t}`);if(r.ok){const s=await r.text(),n=(parseInt(s)/1e8).toFixed(8);return e.json({success:!0,currency:"BTC",address:t,balance:n,balanceSatoshi:s})}else throw new Error("Failed to fetch Bitcoin balance")}catch(r){return console.error("Blockchain.info API error:",r),e.json({success:!0,currency:"BTC",address:t,balance:"0.00000000",demo:!0,message:"⚠️ DEMO MODE: Unable to fetch real balance from Blockchain.info",error:r.message})}}catch{return e.json({error:"Failed to fetch Bitcoin balance"},500)}});f.get("/api/crypto/ethereum/:address",async e=>{try{const t=e.req.param("address"),r=e.env.ETHERSCAN_API_KEY;try{const s=r&&r.length===32&&r!=="your_key_here",n=s?`https://api.etherscan.io/api?module=account&action=balance&address=${t}&tag=latest&apikey=${r}`:`https://api.etherscan.io/api?module=account&action=balance&address=${t}&tag=latest`,o=await(await fetch(n)).json();if(o.status==="1"&&o.result){const i=(parseInt(o.result)/1e18).toFixed(8);return e.json({success:!0,currency:"ETH",address:t,balance:i,balanceWei:o.result,note:s?"Using Etherscan API with key":"Using public Etherscan API (rate limited)"})}else{if(o.message&&o.message.includes("rate limit"))return e.json({error:"Rate limit exceeded",message:"Public API rate limit reached. Get free API key at https://etherscan.io/apis",details:o.message},429);throw new Error(o.message||"Failed to fetch balance")}}catch(s){return console.error("Etherscan API error:",s),e.json({success:!0,currency:"ETH",address:t,balance:"0.00000000",demo:!0,message:"⚠️ DEMO MODE: Unable to fetch real balance. Get free API key at https://etherscan.io/apis",error:s.message})}}catch{return e.json({error:"Failed to fetch Ethereum balance"},500)}});f.get("/api/crypto/usdt/:address",async e=>{try{const t=e.req.param("address"),r=e.env.ETHERSCAN_API_KEY,s="0xdac17f958d2ee523a2206206994597c13d831ec7";try{const n=r&&r.length===32&&r!=="your_key_here",a=n?`https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${s}&address=${t}&tag=latest&apikey=${r}`:`https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${s}&address=${t}&tag=latest`,i=await(await fetch(a)).json();if(i.status==="1"&&i.result){const c=(parseInt(i.result)/1e6).toFixed(6);return e.json({success:!0,currency:"USDT",address:t,balance:c,balanceRaw:i.result,network:"Ethereum (ERC-20)",note:n?"Using Etherscan API with key":"Using public Etherscan API (rate limited)"})}else{if(i.message&&i.message.includes("rate limit"))return e.json({error:"Rate limit exceeded",message:"Public API rate limit reached. Get free API key at https://etherscan.io/apis",details:i.message},429);throw new Error(i.message||"Failed to fetch balance")}}catch(n){return console.error("Etherscan USDT API error:",n),e.json({success:!0,currency:"USDT",address:t,balance:"0.000000",demo:!0,network:"Ethereum (ERC-20)",message:"⚠️ DEMO MODE: Unable to fetch real balance. Get free API key at https://etherscan.io/apis",error:n.message})}}catch{return e.json({error:"Failed to fetch USDT balance"},500)}});f.get("/test",e=>e.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Test Page</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
    </head>
    <body class="bg-gray-900 text-white p-8">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold mb-4">🔧 API Test Page</h1>
            <p class="mb-4">Test the backend APIs directly to see if they're working.</p>
            
            <div class="space-y-4">
                <div class="bg-gray-800 p-4 rounded">
                    <h2 class="font-bold mb-2">Test 1: Login/Register</h2>
                    <button onclick="testAuth()" class="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                        Test Auth
                    </button>
                    <div id="auth-result" class="mt-2 text-sm"></div>
                </div>
                
                <div class="bg-gray-800 p-4 rounded">
                    <h2 class="font-bold mb-2">Test 2: Create Room</h2>
                    <button onclick="testCreateRoom()" class="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                        Test Create Room
                    </button>
                    <div id="room-result" class="mt-2 text-sm"></div>
                </div>
                
                <div class="bg-gray-800 p-4 rounded">
                    <h2 class="font-bold mb-2">Console Output</h2>
                    <div id="console" class="bg-black p-4 rounded font-mono text-xs h-64 overflow-auto"></div>
                </div>
            </div>
        </div>

        <script>
            let userId = null;
            const consoleDiv = document.getElementById('console');
            
            function log(msg) {
                console.log(msg);
                const time = new Date().toLocaleTimeString();
                consoleDiv.innerHTML += time + ': ' + msg + '<br>';
                consoleDiv.scrollTop = consoleDiv.scrollHeight;
            }
            
            async function testAuth() {
                log('Testing auth...');
                const username = 'TestUser' + Date.now();
                
                try {
                    // Try login
                    log('POST /api/auth/login');
                    let res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username})
                    });
                    let data = await res.json();
                    log('Login response: ' + JSON.stringify(data));
                    
                    if (!res.ok) {
                        // Register
                        log('POST /api/auth/register');
                        res = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({username, publicKey: 'test-key-123'})
                        });
                        data = await res.json();
                        log('Register response: ' + JSON.stringify(data));
                        
                        if (res.ok) {
                            userId = data.userId;
                            document.getElementById('auth-result').innerHTML = 
                                '<span class="text-green-400">✓ Success! User ID: ' + userId + '</span>';
                            log('✓ Auth successful');
                            return;
                        }
                    } else {
                        userId = data.user.id;
                        document.getElementById('auth-result').innerHTML = 
                            '<span class="text-green-400">✓ Login successful! User ID: ' + userId + '</span>';
                        log('✓ Login successful');
                        return;
                    }
                    
                    throw new Error('Auth failed');
                } catch (error) {
                    log('✗ Error: ' + error.message);
                    document.getElementById('auth-result').innerHTML = 
                        '<span class="text-red-400">✗ Failed: ' + error.message + '</span>';
                }
            }
            
            async function testCreateRoom() {
                if (!userId) {
                    alert('Run Test Auth first!');
                    return;
                }
                
                log('Testing create room...');
                const roomCode = 'test' + Date.now();
                
                try {
                    log('POST /api/rooms/create');
                    const res = await fetch('/api/rooms/create', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            roomCode,
                            roomName: 'Test Room',
                            userId
                        })
                    });
                    const data = await res.json();
                    log('Create response: ' + JSON.stringify(data));
                    
                    if (res.ok) {
                        document.getElementById('room-result').innerHTML = 
                            '<span class="text-green-400">✓ Room created! ID: ' + data.roomId + '</span>';
                        log('✓ Room created successfully');
                        
                        // Test load messages
                        log('GET /api/messages/' + data.roomId);
                        const msgRes = await fetch('/api/messages/' + data.roomId);
                        const msgData = await msgRes.json();
                        log('Messages response: ' + JSON.stringify(msgData));
                        log('✓✓ ALL TESTS PASSED!');
                    } else {
                        throw new Error(data.error || 'Failed');
                    }
                } catch (error) {
                    log('✗ Error: ' + error.message);
                    document.getElementById('room-result').innerHTML = 
                        '<span class="text-red-400">✗ Failed: ' + error.message + '</span>';
                }
            }
            
            log('Test page loaded. Run tests above.');
        <\/script>
    </body>
    </html>
  `));f.get("/simple",e=>e.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amebo - Simple Version</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <div id="app"></div>
        
        <script>
            // Simple app without caching issues
            let currentUser = null;
            let currentRoom = null;
            
            function renderLogin() {
                document.getElementById('app').innerHTML = \`
                    <div class="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
                        <div class="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                            <div class="text-center mb-8">
                                <div class="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-shield-alt text-white text-3xl"></i>
                                </div>
                                <h1 class="text-3xl font-bold text-gray-800">Amebo</h1>
                                <p class="text-gray-600 mt-2">Simple Working Version</p>
                            </div>
                            
                            <input 
                                type="text" 
                                id="username" 
                                placeholder="Enter username"
                                class="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            
                            <button 
                                onclick="handleLogin()"
                                class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
                            >
                                <i class="fas fa-sign-in-alt mr-2"></i>Login / Register
                            </button>
                        </div>
                    </div>
                \`;
            }
            
            function renderRoomPrompt() {
                document.getElementById('app').innerHTML = \`
                    <div class="min-h-screen bg-gradient-to-br from-teal-600 to-green-700 flex items-center justify-center p-4">
                        <div class="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                            <div class="text-center mb-8">
                                <h2 class="text-2xl font-bold text-gray-800">Welcome, \${currentUser.username}!</h2>
                                <p class="text-gray-600 mt-2">Enter room code</p>
                            </div>
                            
                            <input 
                                type="text" 
                                id="roomcode" 
                                placeholder="Enter room code"
                                class="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            
                            <button 
                                onclick="handleJoinRoom()"
                                class="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 mb-3"
                            >
                                <i class="fas fa-sign-in-alt mr-2"></i>Join Room
                            </button>
                            
                            <button 
                                onclick="handleCreateRoom()"
                                class="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 mb-3"
                            >
                                <i class="fas fa-plus-circle mr-2"></i>Create New Room
                            </button>
                            
                            <button 
                                onclick="renderLogin()"
                                class="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300"
                            >
                                <i class="fas fa-sign-out-alt mr-2"></i>Logout
                            </button>
                        </div>
                    </div>
                \`;
            }
            
            function renderChat() {
                document.getElementById('app').innerHTML = \`
                    <div class="min-h-screen bg-gray-50 flex flex-col">
                        <div class="bg-teal-600 text-white p-4 flex items-center justify-between">
                            <div>
                                <div class="font-bold">\${currentRoom.room_name}</div>
                                <div class="text-xs">Room Code: \${currentRoom.room_code}</div>
                            </div>
                            <button onclick="renderRoomPrompt()" class="hover:bg-teal-700 px-3 py-2 rounded">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                        </div>
                        
                        <div class="flex-1 p-4 overflow-y-auto" id="messages">
                            <div class="text-center text-gray-500 py-8">
                                <p class="text-lg font-semibold">🎉 You're in the chat room!</p>
                                <p class="text-sm mt-2">Room: \${currentRoom.room_name}</p>
                                <p class="text-xs mt-1">Code: \${currentRoom.room_code}</p>
                                <p class="text-xs mt-4 text-green-600">✅ Backend is working perfectly!</p>
                            </div>
                        </div>
                        
                        <div class="p-4 bg-white border-t">
                            <div class="flex space-x-2">
                                <input 
                                    type="text" 
                                    placeholder="Type a message..."
                                    class="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <button class="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                \`;
            }
            
            async function handleLogin() {
                const username = document.getElementById('username').value.trim();
                if (!username) {
                    alert('Please enter a username');
                    return;
                }
                
                try {
                    // Try login
                    let res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username})
                    });
                    
                    let data = await res.json();
                    
                    if (!res.ok) {
                        // Register
                        res = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({username, publicKey: 'simple-key-' + Date.now()})
                        });
                        data = await res.json();
                    }
                    
                    if (res.ok) {
                        currentUser = {
                            id: data.userId || data.user.id,
                            username: username
                        };
                        renderRoomPrompt();
                    } else {
                        alert('Login failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
            
            async function handleCreateRoom() {
                const roomCode = document.getElementById('roomcode').value.trim();
                if (!roomCode) {
                    alert('Please enter a room code');
                    return;
                }
                
                if (roomCode.length < 6) {
                    alert('Room code must be at least 6 characters');
                    return;
                }
                
                try {
                    const res = await fetch('/api/rooms/create', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            roomCode,
                            roomName: 'Room ' + roomCode.substring(0, 8),
                            userId: currentUser.id
                        })
                    });
                    
                    const data = await res.json();
                    
                    if (res.ok) {
                        currentRoom = {
                            id: data.roomId,
                            room_code: roomCode,
                            room_name: 'Room ' + roomCode.substring(0, 8)
                        };
                        renderChat();
                    } else {
                        alert('Create failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
            
            async function handleJoinRoom() {
                const roomCode = document.getElementById('roomcode').value.trim();
                if (!roomCode) {
                    alert('Please enter a room code');
                    return;
                }
                
                try {
                    const res = await fetch('/api/rooms/join', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            roomCode,
                            userId: currentUser.id
                        })
                    });
                    
                    const data = await res.json();
                    
                    if (res.ok) {
                        // Load room info
                        const roomsRes = await fetch('/api/rooms/user/' + currentUser.id);
                        const roomsData = await roomsRes.json();
                        const room = roomsData.rooms.find(r => r.room_code === roomCode);
                        
                        if (room) {
                            currentRoom = room;
                            renderChat();
                        } else {
                            alert('Room joined but not found in your rooms list');
                        }
                    } else {
                        alert('Join failed: ' + (data.error || 'Unknown error'));
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            }
            
            // Start app
            renderLogin();
        <\/script>
    </body>
    </html>
  `));f.get("/",e=>e.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="theme-color" content="#4F46E5">
        <meta name="description" content="Secure encrypted messaging and payments">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <title>Amebo</title>
        
        <link rel="manifest" href="/static/manifest.json">
        <link rel="icon" type="image/svg+xml" href="/static/icon-192.svg">
        <link rel="apple-touch-icon" href="/static/icon-512.svg">
        
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .chat-message { animation: slideIn 0.3s ease-out; }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .loading-spinner {
            border: 3px solid #f3f4f6;
            border-top: 3px solid #4F46E5;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <div id="app"></div>
        
        <!-- V3 INDUSTRIAL GRADE - E2E Encryption + Token System -->
        <script src="/static/crypto-v2.js?v=20251220-v4"><\/script>
        <script src="/static/app-v3.js?v=20251220-v6"><\/script>
        
        <script>
          // Register service worker for PWA
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/static/sw.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed'));
            });
          }
        <\/script>
    </body>
    </html>
  `));function $e(e){return e>=1e3?{tier:"platinum",multiplier:2}:e>=500?{tier:"gold",multiplier:1.5}:e>=100?{tier:"silver",multiplier:1.2}:{tier:"bronze",multiplier:1}}async function bt(e,t,r){const s=new Date().toISOString().substring(0,7),n=await e.prepare(`
    SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'monthly_total_cap' AND is_active = 1
  `).first(),a=(n==null?void 0:n.cap_value)||1500,o=await e.prepare(`
    SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'warning_threshold' AND is_active = 1
  `).first(),i=(o==null?void 0:o.cap_value)||1400;let c=await e.prepare(`
    SELECT * FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
  `).bind(t,s).first();c||(await e.prepare(`
      INSERT INTO monthly_earning_caps (user_id, year_month, total_earned, messages_count, files_count, rooms_created_count, rooms_joined_count)
      VALUES (?, ?, 0, 0, 0, 0, 0)
    `).bind(t,s).run(),c={total_earned:0});const d=c.total_earned||0,l=a-d;if(d+r>a)return await e.prepare(`
      INSERT INTO monthly_cap_history (user_id, year_month, action, tokens_earned, tokens_total, cap_limit, exceeded)
      VALUES (?, ?, 'cap_exceeded', ?, ?, ?, 1)
    `).bind(t,s,r,d,a).run(),{allowed:!1,reason:`Monthly token limit reached! You've earned ${d}/${a} tokens this month. Resets next month.`,current:d,limit:a,remaining:l>0?l:0,isWarning:!1};const p=d+r>=i;return{allowed:!0,current:d,limit:a,remaining:l-r,isWarning:p}}async function vt(e,t,r,s){const n=new Date().toISOString().substring(0,7);let a="";switch(s){case"message":case"message_sent":a="messages_count";break;case"file_share":case"file_shared":a="files_count";break;case"room_create":a="rooms_created_count";break;case"room_join":a="rooms_joined_count";break}a?await e.prepare(`
      UPDATE monthly_earning_caps 
      SET total_earned = total_earned + ?,
          ${a} = ${a} + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND year_month = ?
    `).bind(r,t,n).run():await e.prepare(`
      UPDATE monthly_earning_caps 
      SET total_earned = total_earned + ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND year_month = ?
    `).bind(r,t,n).run();const o=await e.prepare(`
    SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'monthly_total_cap' AND is_active = 1
  `).first(),i=(o==null?void 0:o.cap_value)||1500,c=await e.prepare(`
    SELECT total_earned FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
  `).bind(t,n).first(),d=(c==null?void 0:c.total_earned)||0;await e.prepare(`
    INSERT INTO monthly_cap_history (user_id, year_month, action, tokens_earned, tokens_total, cap_limit, exceeded)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `).bind(t,n,s,r,d,i).run(),await e.prepare(`
    UPDATE users 
    SET current_month_tokens = ?,
        last_token_reset_month = ?
    WHERE id = ?
  `).bind(d,n,t).run()}async function yr(e,t,r,s){const n=new Date().toISOString().split("T")[0];let a=await e.prepare(`
    SELECT * FROM daily_earning_caps WHERE user_id = ? AND date = ?
  `).bind(t,n).first();a||(await e.prepare(`
      INSERT INTO daily_earning_caps (user_id, date, messages_count, files_count, total_earned)
      VALUES (?, ?, 0, 0, 0)
    `).bind(t,n).run(),a={messages_count:0,files_count:0,total_earned:0});const o=100,i=60,c=500;return r==="message_sent"&&a.messages_count+s>o?{allowed:!1,reason:"Daily message token limit reached",current:a.messages_count,limit:o}:r==="file_shared"&&a.files_count+s>i?{allowed:!1,reason:"Daily file sharing token limit reached",current:a.files_count,limit:i}:a.total_earned+s>c?{allowed:!1,reason:"Daily total token limit reached",current:a.total_earned,limit:c}:{allowed:!0}}f.post("/api/tokens/award",async e=>{try{const{userId:t,amount:r,reason:s}=await e.req.json();if(!t||!r)return e.json({error:"User ID and amount required"},400);if(r<=0)return e.json({error:"Amount must be greater than 0"},400);const n=await e.env.DB.prepare(`
      SELECT tokens, token_tier, total_earned FROM users WHERE id = ?
    `).bind(t).first();if(!n)return e.json({error:"User not found"},404);const a=n.tokens||0,{tier:o,multiplier:i}=$e(a),c=await bt(e.env.DB,t,r);if(!c.allowed)return console.log(`[TOKEN ECONOMY] ❌ Monthly limit reached for ${t}: ${c.reason}`),e.json({error:c.reason,monthlyLimitReached:!0,current:c.current,limit:c.limit,remaining:c.remaining},429);const d=["message_sent","file_shared","message","file_share"];if(d.includes(s)){const y=await yr(e.env.DB,t,s,r);if(!y.allowed)return console.log(`[TOKEN ECONOMY] ⚠️ Daily limit reached for ${t}: ${y.reason}`),e.json({error:y.reason,dailyLimitReached:!0,current:y.current,limit:y.limit},429)}const l=Math.floor(r*i),p=a+l,m=$e(p).tier;if(await e.env.DB.prepare(`
      UPDATE users 
      SET tokens = tokens + ?, 
          token_tier = ?,
          total_earned = total_earned + ?
      WHERE id = ?
    `).bind(l,m,l,t).run(),await e.env.DB.prepare(`
      INSERT INTO token_earnings (user_id, action, amount, tier, daily_total)
      VALUES (?, ?, ?, ?, ?)
    `).bind(t,s,l,o,l).run(),d.includes(s)){const y=new Date().toISOString().split("T")[0],E=s==="message_sent"||s==="message"?"messages_count":"files_count";await e.env.DB.prepare(`
        UPDATE daily_earning_caps 
        SET ${E} = ${E} + ?,
            total_earned = total_earned + ?
        WHERE user_id = ? AND date = ?
      `).bind(l,l,t,y).run()}await vt(e.env.DB,t,l,s);const h=i>1?` (${o} tier ${i}x bonus!)`:"",b=c.isWarning?` ⚠️ Approaching monthly limit (${c.current+l}/${c.limit})`:"";return console.log(`[TOKEN ECONOMY] User ${t} earned ${l} tokens for ${s}${h}. New balance: ${p}${b}`),e.json({success:!0,newBalance:p,amount:l,baseAmount:r,multiplier:i,tier:m,tierBonus:i>1,reason:s,monthlyLimit:c.limit,monthlyEarned:c.current+l,monthlyRemaining:c.remaining,monthlyWarning:c.isWarning,monthlyPercentage:Math.floor((c.current+l)/c.limit*100)})}catch(t){return console.error("Award tokens error:",t),e.json({error:"Failed to award tokens"},500)}});f.get("/api/tokens/balance/:userId",async e=>{try{const t=e.req.param("userId"),r=await e.env.DB.prepare(`
      SELECT tokens, token_tier, total_earned, total_spent FROM users WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"User not found"},404);const s=r.tokens||0,{tier:n,multiplier:a}=$e(s),o=new Date().toISOString().split("T")[0],i=await e.env.DB.prepare(`
      SELECT messages_count, files_count, total_earned FROM daily_earning_caps
      WHERE user_id = ? AND date = ?
    `).bind(t,o).first();return e.json({success:!0,balance:s,tier:n,multiplier:a,totalEarned:r.total_earned||0,totalSpent:r.total_spent||0,dailyProgress:{messages:(i==null?void 0:i.messages_count)||0,files:(i==null?void 0:i.files_count)||0,total:(i==null?void 0:i.total_earned)||0,limits:{messages:100,files:60,total:500}},nextTier:n==="bronze"?"silver (100 tokens)":n==="silver"?"gold (500 tokens)":n==="gold"?"platinum (1000 tokens)":"max tier reached"})}catch(t){return console.error("Get balance error:",t),e.json({error:"Failed to get balance"},500)}});f.get("/api/tokens/stats/:userId",async e=>{try{const t=e.req.param("userId"),r=new Date().toISOString().split("T")[0],s=await e.env.DB.prepare(`
      SELECT username, tokens, token_tier, total_earned, total_spent,
             email, email_verified
      FROM users 
      WHERE id = ?
    `).bind(t).first();if(!s)return e.json({error:"User not found"},404);const a=await e.env.DB.prepare(`
      SELECT messages_count, files_count, total_earned
      FROM daily_earning_caps
      WHERE user_id = ? AND date = ?
    `).bind(t,r).first()||{messages_count:0,files_count:0,total_earned:0};return e.json({success:!0,data:{username:s.username,email:s.email,token_balance:s.tokens,token_tier:s.token_tier,total_tokens_earned:s.total_earned||0,total_tokens_spent:s.total_spent||0,daily_messages_sent:a.messages_count,daily_files_sent:a.files_count,daily_tokens_earned:a.total_earned,daily_message_cap:100,daily_file_cap:60,daily_total_cap:500}})}catch(t){return console.error("Get stats error:",t),e.json({error:"Failed to get stats"},500)}});f.get("/api/tokens/history/:userId",async e=>{try{const t=e.req.param("userId"),r=parseInt(e.req.query("limit")||"50"),s=await e.env.DB.prepare(`
      SELECT action as type, amount, tier, created_at 
      FROM token_earnings 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(t,r).all();return e.json({success:!0,data:s.results||[]})}catch(t){return console.error("Get history error:",t),e.json({error:"Failed to get history"},500)}});f.get("/api/tokens/monthly/:userId",async e=>{try{const t=e.req.param("userId"),r=new Date().toISOString().substring(0,7),s=await e.env.DB.prepare(`
      SELECT cap_name, cap_value FROM monthly_cap_config WHERE is_active = 1
    `).all(),n={};s.results.forEach(h=>{n[h.cap_name]=h.cap_value});const a=n.monthly_total_cap||1500,o=n.warning_threshold||1400,i=await e.env.DB.prepare(`
      SELECT * FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
    `).bind(t,r).first(),c=(i==null?void 0:i.total_earned)||0,d=a-c,l=Math.floor(c/a*100);let p="normal";c>=a?p="capped":c>=o&&(p="warning");const m=await e.env.DB.prepare(`
      SELECT action, tokens_earned, tokens_total, created_at
      FROM monthly_cap_history
      WHERE user_id = ? AND year_month = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(t,r).all();return e.json({success:!0,data:{yearMonth:r,earned:c,limit:a,remaining:d>0?d:0,percentage:l,status:p,warningThreshold:o,breakdown:{messages:(i==null?void 0:i.messages_count)||0,files:(i==null?void 0:i.files_count)||0,roomsCreated:(i==null?void 0:i.rooms_created_count)||0,roomsJoined:(i==null?void 0:i.rooms_joined_count)||0},history:m.results||[]}})}catch(t){return console.error("Get monthly stats error:",t),e.json({error:"Failed to get monthly stats"},500)}});f.post("/api/tokens/bonus/award",async e=>{try{const{userId:t,bonusType:r}=await e.req.json();if(!t||!r)return e.json({error:"User ID and bonus type required"},400);const s=new Date().toISOString().substring(0,7);if(await e.env.DB.prepare(`
      SELECT * FROM user_bonus_achievements 
      WHERE user_id = ? AND year_month = ? AND bonus_type = ?
    `).bind(t,s,r).first())return e.json({error:"Bonus already awarded this month",alreadyAwarded:!0},400);const a=await e.env.DB.prepare(`
      SELECT cap_value FROM monthly_cap_config 
      WHERE cap_name = ? AND is_active = 1
    `).bind(`bonus_${r}`).first();if(!a)return e.json({error:"Invalid bonus type"},400);const o=a.cap_value,i=await bt(e.env.DB,t,o);if(!i.allowed)return e.json({error:`Cannot award bonus - monthly limit reached (${i.current}/${i.limit})`,monthlyLimitReached:!0,current:i.current,limit:i.limit},429);const c=await e.env.DB.prepare(`
      SELECT tokens FROM users WHERE id = ?
    `).bind(t).first();if(!c)return e.json({error:"User not found"},404);await e.env.DB.prepare(`
      UPDATE users 
      SET tokens = tokens + ?,
          total_earned = total_earned + ?
      WHERE id = ?
    `).bind(o,o,t).run(),await e.env.DB.prepare(`
      INSERT INTO user_bonus_achievements (user_id, year_month, bonus_type, bonus_amount)
      VALUES (?, ?, ?, ?)
    `).bind(t,s,r,o).run(),await vt(e.env.DB,t,o,`bonus_${r}`);const d=(c.tokens||0)+o;return console.log(`[BONUS] User ${t} earned ${o} bonus tokens for ${r}. New balance: ${d}`),e.json({success:!0,bonusType:r,bonusAmount:o,newBalance:d,message:`🎉 +${o} bonus tokens!`,monthlyEarned:i.current+o,monthlyLimit:i.limit,monthlyRemaining:i.remaining})}catch(t){return console.error("Award bonus error:",t),e.json({error:"Failed to award bonus"},500)}});f.get("/api/tokens/bonus/:userId",async e=>{try{const t=e.req.param("userId"),r=new Date().toISOString().substring(0,7),s=await e.env.DB.prepare(`
      SELECT bonus_type, bonus_amount, earned_at
      FROM user_bonus_achievements
      WHERE user_id = ? AND year_month = ?
      ORDER BY earned_at DESC
    `).bind(t,r).all(),n=await e.env.DB.prepare(`
      SELECT SUM(bonus_amount) as total FROM user_bonus_achievements
      WHERE user_id = ? AND year_month = ?
    `).bind(t,r).first(),a=(n==null?void 0:n.total)||0,o=await e.env.DB.prepare(`
      SELECT cap_name, cap_value, description 
      FROM monthly_cap_config 
      WHERE cap_name LIKE 'bonus_%' AND is_active = 1
    `).all(),i=s.results.map(h=>h.bonus_type),c=o.results.filter(h=>{const b=h.cap_name.replace("bonus_","");return!i.includes(b)}).map(h=>({type:h.cap_name.replace("bonus_",""),amount:h.cap_value,description:h.description})),d=await e.env.DB.prepare(`
      SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'monthly_total_cap' AND is_active = 1
    `).first(),l=(d==null?void 0:d.cap_value)||1500,p=await e.env.DB.prepare(`
      SELECT total_earned FROM monthly_earning_caps WHERE user_id = ? AND year_month = ?
    `).bind(t,r).first(),m=(p==null?void 0:p.total_earned)||0;return e.json({success:!0,data:{monthlyLimit:l,monthlyEarned:m,monthlyRemaining:l-m,totalBonusTokensEarned:a,earned:s.results||[],available:c,note:"Bonuses award instant tokens that count toward the 1500 monthly limit"}})}catch(t){return console.error("Get bonuses error:",t),e.json({error:"Failed to get bonuses"},500)}});f.post("/api/users/pin/set",async e=>{try{const{userId:t,pin:r}=await e.req.json();if(!t||!r)return e.json({error:"User ID and PIN required"},400);if(r.length!==4||!/^\d{4}$/.test(r))return e.json({error:"PIN must be exactly 4 digits"},400);const s=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(r)),n=Array.from(new Uint8Array(s)).map(a=>a.toString(16).padStart(2,"0")).join("");return await e.env.DB.prepare(`
      UPDATE users SET pin = ? WHERE id = ?
    `).bind(n,t).run(),e.json({success:!0,message:"PIN set successfully"})}catch(t){return console.error("Set PIN error:",t),e.json({error:"Failed to set PIN"},500)}});f.post("/api/users/pin/verify",async e=>{try{const{userId:t,pin:r}=await e.req.json();if(!t||!r)return e.json({error:"User ID and PIN required"},400);const s=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(r)),n=Array.from(new Uint8Array(s)).map(i=>i.toString(16).padStart(2,"0")).join(""),a=await e.env.DB.prepare(`
      SELECT pin FROM users WHERE id = ?
    `).bind(t).first();if(!a||!a.pin)return e.json({verified:!1,error:"No PIN set"},400);const o=a.pin===n;return e.json({verified:o})}catch(t){return console.error("Verify PIN error:",t),e.json({error:"Failed to verify PIN"},500)}});f.get("/api/users/:userId/has-pin",async e=>{try{const t=e.req.param("userId"),r=await e.env.DB.prepare(`
      SELECT pin FROM users WHERE id = ?
    `).bind(t).first();return e.json({hasPin:!!(r&&r.pin)})}catch(t){return console.error("Check PIN error:",t),e.json({error:"Failed to check PIN"},500)}});f.post("/api/users/pin/security-question",async e=>{try{const{userId:t,question:r,answer:s}=await e.req.json();if(!t||!r||!s)return e.json({error:"User ID, question, and answer required"},400);if(s.trim().length<3)return e.json({error:"Answer must be at least 3 characters"},400);const n=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s.toLowerCase().trim())),a=Array.from(new Uint8Array(n)).map(o=>o.toString(16).padStart(2,"0")).join("");return await e.env.DB.prepare(`
      UPDATE users 
      SET security_question = ?, security_answer = ?
      WHERE id = ?
    `).bind(r,a,t).run(),console.log(`[SECURITY] User ${t} set security question`),e.json({success:!0,message:"Security question set successfully"})}catch(t){return console.error("Set security question error:",t),e.json({error:"Failed to set security question"},500)}});f.get("/api/users/:userId/security-question",async e=>{try{const t=e.req.param("userId"),r=await e.env.DB.prepare(`
      SELECT security_question FROM users WHERE id = ?
    `).bind(t).first();return!r||!r.security_question?e.json({error:"No security question set"},404):e.json({success:!0,question:r.security_question})}catch(t){return console.error("Get security question error:",t),e.json({error:"Failed to get security question"},500)}});f.post("/api/users/pin/reset",async e=>{try{const{userId:t,answer:r,newPin:s}=await e.req.json();if(!t||!r||!s)return e.json({error:"User ID, answer, and new PIN required"},400);if(s.length!==4||!/^\d{4}$/.test(s))return e.json({error:"PIN must be exactly 4 digits"},400);const n=await e.env.DB.prepare(`
      SELECT security_answer, pin_reset_attempts, last_pin_reset FROM users WHERE id = ?
    `).bind(t).first();if(!n||!n.security_answer)return e.json({error:"No security question set"},404);const a=new Date;if(n.last_pin_reset){const l=new Date(n.last_pin_reset),p=(a.getTime()-l.getTime())/(1e3*60*60);if(p<1&&n.pin_reset_attempts>=5)return e.json({error:"Too many reset attempts. Please try again in 1 hour.",remainingTime:Math.ceil((1-p)*60)},429);p>=1&&await e.env.DB.prepare(`
          UPDATE users SET pin_reset_attempts = 0 WHERE id = ?
        `).bind(t).run()}const o=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(r.toLowerCase().trim())),i=Array.from(new Uint8Array(o)).map(l=>l.toString(16).padStart(2,"0")).join("");if(n.security_answer!==i){await e.env.DB.prepare(`
        UPDATE users 
        SET pin_reset_attempts = pin_reset_attempts + 1,
            last_pin_reset = ?
        WHERE id = ?
      `).bind(a.toISOString(),t).run();const l=(n.pin_reset_attempts||0)+1,p=5-l;return console.log(`[PIN RESET] Failed attempt for user ${t}. Attempts: ${l}/5`),e.json({error:"Incorrect answer",verified:!1,remainingAttempts:Math.max(0,p)},400)}const c=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)),d=Array.from(new Uint8Array(c)).map(l=>l.toString(16).padStart(2,"0")).join("");return await e.env.DB.prepare(`
      UPDATE users 
      SET pin = ?, 
          pin_reset_attempts = 0,
          last_pin_reset = ?
      WHERE id = ?
    `).bind(d,a.toISOString(),t).run(),console.log(`[PIN RESET] User ${t} successfully reset PIN`),e.json({success:!0,verified:!0,message:"PIN reset successfully"})}catch(t){return console.error("Reset PIN error:",t),e.json({error:"Failed to reset PIN"},500)}});f.post("/api/tokens/gift",async e=>{try{const{fromUserId:t,toUserId:r,amount:s,roomId:n,message:a,pin:o}=await e.req.json();if(!t||!r||!s||!o)return e.json({error:"From user, to user, amount, and PIN required"},400);if(s<=0)return e.json({error:"Amount must be greater than 0"},400);if(t===r)return e.json({error:"Cannot send tokens to yourself"},400);const i=new Date,c=new Date(i.getFullYear(),0,1),d=Math.floor((i.getTime()-c.getTime())/(1440*60*1e3)),l=Math.ceil((d+c.getDay()+1)/7),p=`${i.getFullYear()}-${String(l).padStart(2,"0")}`,m=await e.env.DB.prepare(`
      SELECT config_value FROM weekly_gift_config WHERE config_name = 'weekly_gift_limit' AND is_active = 1
    `).bind().first(),h=(m==null?void 0:m.config_value)||150;let b=await e.env.DB.prepare(`
      SELECT * FROM weekly_gift_tracking WHERE user_id = ? AND year_week = ?
    `).bind(t,p).first();b||(await e.env.DB.prepare(`
        INSERT INTO weekly_gift_tracking (user_id, year_week, total_gifted, gift_count)
        VALUES (?, ?, 0, 0)
      `).bind(t,p).run(),b={user_id:t,year_week:p,total_gifted:0,gift_count:0});const y=b.total_gifted||0,E=h-y;if(y+s>h)return console.log(`[WEEKLY GIFT LIMIT] User ${t} exceeded weekly limit. Current: ${y}, Attempting: ${s}, Limit: ${h}`),await e.env.DB.prepare(`
        INSERT INTO weekly_gift_history (user_id, year_week, amount, recipient_id, total_gifted_after, limit_value, exceeded)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `).bind(t,p,s,r,y,h).run(),e.json({error:`Weekly gift limit reached! You can only gift ${h} tokens per week. You have gifted ${y} tokens this week. Remaining: ${E} tokens`,weeklyLimit:h,weeklyGifted:y,weeklyRemaining:E,limitExceeded:!0},400);const T=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(o)),x=Array.from(new Uint8Array(T)).map(Rt=>Rt.toString(16).padStart(2,"0")).join(""),D=await e.env.DB.prepare(`
      SELECT pin, tokens, username FROM users WHERE id = ?
    `).bind(t).first();if(!D)return e.json({error:"User not found"},404);if(!D.pin)return e.json({error:"Please set a PIN first"},400);if(D.pin!==x)return e.json({error:"Invalid PIN"},401);const N=D.tokens||0;if(N<s)return e.json({error:`Insufficient tokens. You have ${N} tokens`},400);const R=await e.env.DB.prepare(`
      SELECT username, tokens FROM users WHERE id = ?
    `).bind(r).first();if(!R)return e.json({error:"Recipient not found"},404);console.log(`[TOKEN GIFT] ${D.username} sending ${s} tokens to ${R.username} (Weekly: ${y+s}/${h})`);const Z=await e.env.DB.prepare(`
      UPDATE users SET tokens = tokens - ? WHERE id = ?
    `).bind(s,t).run();console.log(`[TOKEN GIFT] Deducted ${s} tokens from sender`);const ee=await e.env.DB.prepare(`
      UPDATE users SET tokens = tokens + ? WHERE id = ?
    `).bind(s,r).run();console.log(`[TOKEN GIFT] Added ${s} tokens to receiver`);const P=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO token_transactions (id, from_user_id, to_user_id, amount, room_id, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(P,t,r,s,n||null,a||null).run(),console.log(`[TOKEN GIFT] Transaction recorded: ${P}`);const C=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(C,r,"token_gift","🎁 Token Gift Received!",`${D.username} sent you ${s} tokens${a?": "+a:""}`,JSON.stringify({fromUserId:t,amount:s,message:a,transactionId:P})).run(),console.log("[TOKEN GIFT] Notification created for receiver");const U=y+s;await e.env.DB.prepare(`
      UPDATE weekly_gift_tracking 
      SET total_gifted = ?, gift_count = gift_count + 1, last_gift_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND year_week = ?
    `).bind(U,t,p).run(),console.log(`[WEEKLY GIFT TRACKING] Updated: ${U}/${h} tokens gifted this week`),await e.env.DB.prepare(`
      INSERT INTO weekly_gift_history (user_id, year_week, amount, recipient_id, total_gifted_after, limit_value, exceeded)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).bind(t,p,s,r,U,h).run();const A=N-s,B=(R.tokens||0)+s,de=h-U;let Le="";return de<=30&&de>0?Le=` ⚠️ Only ${de} tokens remaining this week!`:de===0&&(Le=" 🚫 Weekly gift limit reached!"),e.json({success:!0,message:`Successfully sent ${s} tokens to ${R.username}${Le}`,transactionId:P,newBalance:A,receiverUsername:R.username,receiverBalance:B,fromUsername:D.username,weeklyGifted:U,weeklyLimit:h,weeklyRemaining:de})}catch(t){return console.error("Gift tokens error:",t),e.json({error:"Failed to gift tokens",details:t.message},500)}});f.get("/api/tokens/weekly-gift-status/:userId",async e=>{try{const t=e.req.param("userId"),r=new Date,s=new Date(r.getFullYear(),0,1),n=Math.floor((r.getTime()-s.getTime())/(1440*60*1e3)),a=Math.ceil((n+s.getDay()+1)/7),o=`${r.getFullYear()}-${String(a).padStart(2,"0")}`,i=await e.env.DB.prepare(`
      SELECT config_value FROM weekly_gift_config WHERE config_name = 'weekly_gift_limit' AND is_active = 1
    `).bind().first(),c=(i==null?void 0:i.config_value)||150,d=await e.env.DB.prepare(`
      SELECT * FROM weekly_gift_tracking WHERE user_id = ? AND year_week = ?
    `).bind(t,o).first(),l=(d==null?void 0:d.total_gifted)||0,p=(d==null?void 0:d.gift_count)||0,m=c-l;return e.json({success:!0,yearWeek:o,weeklyLimit:c,totalGifted:l,remaining:m,giftCount:p,lastGiftAt:(d==null?void 0:d.last_gift_at)||null,limitReached:l>=c,percentageUsed:Math.round(l/c*100)})}catch(t){return console.error("Get weekly gift status error:",t),e.json({error:"Failed to get weekly gift status"},500)}});f.get("/api/tokens/history/:userId",async e=>{try{const t=e.req.param("userId"),{results:r}=await e.env.DB.prepare(`
      SELECT 
        t.*,
        u_from.username as from_username,
        u_to.username as to_username
      FROM token_transactions t
      LEFT JOIN users u_from ON t.from_user_id = u_from.id
      LEFT JOIN users u_to ON t.to_user_id = u_to.id
      WHERE t.from_user_id = ? OR t.to_user_id = ?
      ORDER BY t.created_at DESC
      LIMIT 50
    `).bind(t,t).all();return e.json({success:!0,transactions:r||[]})}catch(t){return console.error("Get token history error:",t),e.json({error:"Failed to get token history"},500)}});f.get("/api/rooms/:roomId/members",async e=>{try{const t=e.req.param("roomId"),{results:r}=await e.env.DB.prepare(`
      SELECT DISTINCT u.id, u.username
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = ?
      ORDER BY u.username
    `).bind(t).all();return e.json({success:!0,members:r||[]})}catch(t){return console.error("Get room members error:",t),e.json({error:"Failed to get room members"},500)}});f.get("/api/notifications/:userId",async e=>{try{const t=e.req.param("userId"),{results:r}=await e.env.DB.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(t).all();return e.json({success:!0,notifications:r||[]})}catch(t){return console.error("Get notifications error:",t),e.json({error:"Failed to get notifications"},500)}});f.post("/api/notifications/:notificationId/read",async e=>{try{const t=e.req.param("notificationId");return await e.env.DB.prepare(`
      UPDATE notifications SET is_read = 1 WHERE id = ?
    `).bind(t).run(),e.json({success:!0})}catch(t){return console.error("Mark notification read error:",t),e.json({error:"Failed to mark notification as read"},500)}});f.get("/api/notifications/:userId/unread-count",async e=>{try{const t=e.req.param("userId"),r=await e.env.DB.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND read = 0
    `).bind(t).first();return e.json({success:!0,count:(r==null?void 0:r.count)||0})}catch(t){return console.error("Get unread count error:",t),e.json({error:"Failed to get unread count"},500)}});f.get("/api/notifications/:userId/unread",async e=>{try{const t=e.req.param("userId"),{results:r}=await e.env.DB.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ? AND is_read = 0
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(t).all();return e.json({success:!0,notifications:r||[]})}catch(t){return console.error("Get unread notifications error:",t),e.json({error:"Failed to get unread notifications"},500)}});f.get("/api/data/plans",async e=>{try{const t=e.req.query("network");let r="SELECT * FROM data_plans WHERE active = 1";const s=[];t&&(r+=" AND network = ?",s.push(t)),r+=" ORDER BY token_cost ASC";const n=await e.env.DB.prepare(r).bind(...s).all();return e.json({success:!0,data:n.results||[]})}catch(t){return console.error("Get data plans error:",t),e.json({error:"Failed to get data plans"},500)}});f.post("/api/data/redeem",async e=>{var t,r,s,n,a,o,i;try{const{userId:c,planCode:d,phoneNumber:l}=await e.req.json();if(!c||!d||!l)return e.json({error:"User ID, plan code, and phone number required"},400);if(!/^0[789][01]\d{8}$/.test(l))return e.json({error:"Invalid Nigerian phone number format"},400);const m=await e.env.DB.prepare(`
      SELECT * FROM data_plans WHERE plan_code = ? AND active = 1
    `).bind(d).first();if(!m)return e.json({error:"Data plan not found"},404);const h=await e.env.DB.prepare(`
      SELECT tokens, email, phone_number FROM users WHERE id = ?
    `).bind(c).first();if(!h)return e.json({error:"User not found"},404);if(h.tokens<m.token_cost)return e.json({error:"Insufficient tokens",required:m.token_cost,current:h.tokens},400);const b=crypto.randomUUID();await e.env.DB.prepare(`
      INSERT INTO data_redemptions (
        user_id, phone_number, network, data_plan, 
        data_amount, token_cost, status, transaction_id
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(c,l,m.network,m.plan_code,m.data_amount,m.token_cost,b).run(),await e.env.DB.prepare(`
      UPDATE users 
      SET tokens = tokens - ?,
          total_spent = total_spent + ?
      WHERE id = ?
    `).bind(m.token_cost,m.token_cost,c).run();let y="pending",E=null,T=null;const x=e.env.VTPASS_API_KEY,D=e.env.VTPASS_PUBLIC_KEY,N=e.env.VTPASS_SECRET_KEY,R=e.env.VTPASS_BASE_URL||"https://sandbox.vtpass.com/api";if(x&&D&&N)try{const P={MTN:"mtn-data",Airtel:"airtel-data",Glo:"glo-data","9mobile":"etisalat-data"}[m.network]||"mtn-data",C=`SCPAY-${Date.now()}-${Math.floor(Math.random()*1e4)}`;console.log(`[VTPASS] Purchasing ${m.data_amount} ${m.network} data for ${l}`);const U=await fetch(`${R}/pay`,{method:"POST",headers:{"api-key":x,"secret-key":N,"Content-Type":"application/json"},body:JSON.stringify({request_id:C,serviceID:P,billersCode:l,variation_code:m.plan_code,amount:parseInt(m.variation_amount||"0"),phone:l})});if(!U.ok)throw new Error(`VTPass API error: ${U.status} ${U.statusText}`);const A=await U.json();console.log(`[VTPASS] Response code: ${A.code}, status: ${(r=(t=A.content)==null?void 0:t.transactions)==null?void 0:r.status}`);const B=(a=(n=(s=A.content)==null?void 0:s.transactions)==null?void 0:n.status)==null?void 0:a.toLowerCase();B==="delivered"||B==="successful"?y="completed":B==="failed"||B==="reversed"?(y="failed",T=A.response_description||"Transaction failed"):y="pending",E=((i=(o=A.content)==null?void 0:o.transactions)==null?void 0:i.transactionId)||C,console.log(`[VTPASS] Transaction ${b} status: ${y}`)}catch(ee){console.error("[VTPASS] API error:",ee),y="failed",T=ee.message||"VTPass API error",await e.env.DB.prepare(`
          UPDATE users 
          SET tokens = tokens + ?,
              total_spent = total_spent - ?
          WHERE id = ?
        `).bind(m.token_cost,m.token_cost,c).run(),console.log(`[VTPASS] Refunded ${m.token_cost} tokens to user ${c} due to API error`)}else console.log("[DATA REDEMPTION] DEMO MODE - VTPass API keys not configured"),y="completed",E="DEMO-"+Date.now();await e.env.DB.prepare(`
      UPDATE data_redemptions 
      SET status = ?,
          api_reference = ?,
          error_message = ?,
          completed_at = ?
      WHERE transaction_id = ?
    `).bind(y,E,T,y!=="pending"?new Date().toISOString():null,b).run(),console.log(`[DATA REDEMPTION] User ${c} redeemed ${m.data_amount} ${m.network} data for ${m.token_cost} tokens`),await e.env.DB.prepare(`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (?, 'data_redeemed', 'Data Redeemed!', ?)
    `).bind(c,`${m.data_amount} ${m.network} data sent to ${l}`).run();const Z=await e.env.DB.prepare(`
      SELECT tokens FROM users WHERE id = ?
    `).bind(c).first();return e.json({success:!0,transactionId:b,message:`${m.data_amount} data will be sent to ${l} shortly`,newBalance:(Z==null?void 0:Z.tokens)||0,redemption:{network:m.network,dataAmount:m.data_amount,phoneNumber:l,status:y}})}catch(c){return console.error("Data redemption error:",c),e.json({error:"Failed to redeem data"},500)}});f.get("/api/data/history/:userId",async e=>{try{const t=e.req.param("userId"),r=parseInt(e.req.query("limit")||"20"),s=await e.env.DB.prepare(`
      SELECT 
        id, phone_number, network, data_amount, 
        token_cost, status, transaction_id, created_at
      FROM data_redemptions 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(t,r).all();return e.json({success:!0,history:s.results||[]})}catch(t){return console.error("Get redemption history error:",t),e.json({error:"Failed to get history"},500)}});f.get("/api/data/status/:transactionId",async e=>{try{const t=e.req.param("transactionId"),r=await e.env.DB.prepare(`
      SELECT * FROM data_redemptions WHERE transaction_id = ?
    `).bind(t).first();return r?e.json({success:!0,status:r.status,details:r}):e.json({error:"Transaction not found"},404)}catch(t){return console.error("Get redemption status error:",t),e.json({error:"Failed to get status"},500)}});f.post("/api/ads/register-advertiser",async e=>{try{const{businessName:t,email:r,phone:s,instagramHandle:n,websiteUrl:a}=await e.req.json();if(!t||!r)return e.json({error:"Business name and email required"},400);if(await e.env.DB.prepare(`
      SELECT id FROM advertisers WHERE email = ?
    `).bind(r).first())return e.json({error:"Email already registered"},409);const i=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO advertisers (id, business_name, email, phone, instagram_handle, website_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(i,t,r,s||null,n||null,a||null).run(),console.log(`[ADS] Advertiser registered: ${t}`),e.json({success:!0,advertiserId:i,message:"Advertiser registered successfully"})}catch(t){return console.error("[ADS] Registration error:",t),e.json({error:"Registration failed"},500)}});f.post("/api/ads/login-advertiser",async e=>{try{const{email:t}=await e.req.json();if(!t)return e.json({error:"Email required"},400);const r=await e.env.DB.prepare(`
      SELECT id, business_name, email, phone, instagram_handle, website_url, created_at
      FROM advertisers WHERE email = ?
    `).bind(t).first();return r?(console.log(`[ADS] Advertiser logged in: ${t}`),e.json({success:!0,advertiserId:r.id,businessName:r.business_name,email:r.email,phone:r.phone,instagramHandle:r.instagram_handle,websiteUrl:r.website_url,message:"Login successful"})):e.json({error:"Account not found. Please register first."},404)}catch(t){return console.error("[ADS] Login error:",t),e.json({error:"Login failed"},500)}});f.post("/api/ads/create-campaign",async e=>{try{const{advertiserId:t,campaignName:r,adImageUrl:s,adTitle:n,adDescription:a,destinationType:o,instagramHandle:i,websiteUrl:c,pricingModel:d,budgetTotal:l,startDate:p,endDate:m}=await e.req.json();if(!t||!r||!s||!n||!o||!d||!l)return e.json({error:"Missing required fields"},400);if(o==="instagram"&&!i)return e.json({error:"Instagram handle required for Instagram destination"},400);if(o==="website"&&!c)return e.json({error:"Website URL required for website destination"},400);if(l<2e3)return e.json({error:"Minimum budget is ₦2,000"},400);const h=crypto.randomUUID();return await e.env.DB.prepare(`
      INSERT INTO ad_campaigns (
        id, advertiser_id, campaign_name, 
        ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, budget_total,
        start_date, end_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).bind(h,t,r,s,n,a||null,o,i||null,c||null,d,l,p||new Date().toISOString(),m||null).run(),console.log(`[ADS] Campaign created: ${r} by advertiser ${t}`),e.json({success:!0,campaignId:h,message:"Campaign created and activated!",status:"active"})}catch(t){return console.error("[ADS] Campaign creation error:",t),e.json({error:"Campaign creation failed"},500)}});f.put("/api/ads/update-campaign/:campaignId",async e=>{try{const t=e.req.param("campaignId"),{campaignName:r,adImageUrl:s,adTitle:n,adDescription:a,destinationType:o,instagramHandle:i,websiteUrl:c,budgetTotal:d}=await e.req.json(),l=await e.env.DB.prepare(`
      SELECT id, advertiser_id, budget_spent FROM ad_campaigns WHERE id = ?
    `).bind(t).first();if(!l)return e.json({error:"Campaign not found"},404);if(!r||!s||!n||!o)return e.json({error:"Missing required fields"},400);if(o==="instagram"&&!i)return e.json({error:"Instagram handle required for Instagram destination"},400);if(o==="website"&&!c)return e.json({error:"Website URL required for website destination"},400);if(d&&d<l.budget_spent)return e.json({error:`Budget cannot be less than already spent (₦${l.budget_spent})`},400);const p=[],m=[];return r&&(p.push("campaign_name = ?"),m.push(r)),s&&(p.push("ad_image_url = ?"),m.push(s)),n&&(p.push("ad_title = ?"),m.push(n)),a!==void 0&&(p.push("ad_description = ?"),m.push(a||null)),o&&(p.push("destination_type = ?"),m.push(o)),i!==void 0&&(p.push("instagram_handle = ?"),m.push(i||null)),c!==void 0&&(p.push("website_url = ?"),m.push(c||null)),d&&(p.push("budget_total = ?"),m.push(d)),m.push(t),await e.env.DB.prepare(`
      UPDATE ad_campaigns 
      SET ${p.join(", ")}
      WHERE id = ?
    `).bind(...m).run(),console.log(`[ADS] Campaign updated: ${t}`),e.json({success:!0,campaignId:t,message:"Campaign updated successfully!"})}catch(t){return console.error("[ADS] Campaign update error:",t),e.json({error:"Campaign update failed"},500)}});f.post("/api/ads/campaign/:campaignId/status",async e=>{try{const t=e.req.param("campaignId"),{status:r}=await e.req.json();return["active","paused"].includes(r)?await e.env.DB.prepare(`
      SELECT id, campaign_name FROM ad_campaigns WHERE id = ?
    `).bind(t).first()?(await e.env.DB.prepare(`
      UPDATE ad_campaigns SET status = ? WHERE id = ?
    `).bind(r,t).run(),console.log(`[ADS] Campaign ${r}: ${t}`),e.json({success:!0,campaignId:t,status:r,message:`Campaign ${r==="active"?"resumed":"paused"} successfully!`})):e.json({error:"Campaign not found"},404):e.json({error:'Invalid status. Use "active" or "paused"'},400)}catch(t){return console.error("[ADS] Campaign status update error:",t),e.json({error:"Status update failed"},500)}});f.get("/api/ads/campaign/:campaignId",async e=>{try{const t=e.req.param("campaignId"),r=await e.env.DB.prepare(`
      SELECT 
        id, advertiser_id, campaign_name,
        ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, budget_total, budget_spent,
        impressions, clicks, status,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE id = ?
    `).bind(t).first();return r?e.json({success:!0,campaign:r}):e.json({error:"Campaign not found"},404)}catch(t){return console.error("[ADS] Get campaign error:",t),e.json({error:"Failed to fetch campaign"},500)}});f.get("/api/ads/active",async e=>{try{const t=e.req.query("userId"),r=await e.env.DB.prepare(`
      SELECT 
        id, ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, impressions, clicks
      FROM ad_campaigns
      WHERE status = 'active'
        AND budget_spent < budget_total
      ORDER BY RANDOM()
      LIMIT 1
    `).first();return r?e.json({success:!0,ad:r}):e.json({success:!0,ad:null,message:"No active ads"})}catch(t){return console.error("[ADS] Get active ads error:",t),e.json({error:"Failed to get ads"},500)}});f.post("/api/ads/impression",async e=>{try{const{campaignId:t,userId:r,sessionId:s}=await e.req.json();if(!t)return e.json({error:"Campaign ID required"},400);const n=await e.env.DB.prepare(`
      SELECT id, pricing_model, cpm_rate, budget_total, budget_spent, impressions
      FROM ad_campaigns
      WHERE id = ? AND status = 'active'
    `).bind(t).first();if(!n)return e.json({error:"Campaign not found or inactive"},404);let a=0;n.pricing_model==="cpm"&&(a=(n.cpm_rate||200)/1e3);const o=(n.budget_spent||0)+a,i=(n.impressions||0)+1;return o>n.budget_total?(await e.env.DB.prepare(`
        UPDATE ad_campaigns SET status = 'completed' WHERE id = ?
      `).bind(t).run(),e.json({success:!0,message:"Campaign budget depleted",campaignCompleted:!0})):(await e.env.DB.prepare(`
      INSERT INTO ad_impressions (campaign_id, user_id, session_id)
      VALUES (?, ?, ?)
    `).bind(t,r||null,s||null).run(),await e.env.DB.prepare(`
      UPDATE ad_campaigns
      SET impressions = ?, budget_spent = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(i,o,t).run(),e.json({success:!0,impressionRecorded:!0}))}catch(t){return console.error("[ADS] Impression tracking error:",t),e.json({error:"Failed to track impression"},500)}});f.post("/api/ads/click",async e=>{try{const{campaignId:t,userId:r,sessionId:s}=await e.req.json();if(!t)return e.json({error:"Campaign ID required"},400);const n=await e.env.DB.prepare(`
      SELECT id, pricing_model, cpc_rate, budget_total, budget_spent, clicks,
             destination_type, instagram_handle, website_url
      FROM ad_campaigns
      WHERE id = ? AND status = 'active'
    `).bind(t).first();if(!n)return e.json({error:"Campaign not found or inactive"},404);let a=0;n.pricing_model==="cpc"&&(a=n.cpc_rate||10);const o=(n.budget_spent||0)+a,i=(n.clicks||0)+1;o>n.budget_total&&await e.env.DB.prepare(`
        UPDATE ad_campaigns SET status = 'completed' WHERE id = ?
      `).bind(t).run(),await e.env.DB.prepare(`
      INSERT INTO ad_clicks (campaign_id, user_id, session_id)
      VALUES (?, ?, ?)
    `).bind(t,r||null,s||null).run(),await e.env.DB.prepare(`
      UPDATE ad_campaigns
      SET clicks = ?, budget_spent = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(i,o,t).run();let c="";return n.destination_type==="instagram"?c=`https://instagram.com/${n.instagram_handle}`:c=n.website_url,e.json({success:!0,clickRecorded:!0,destinationUrl:c})}catch(t){return console.error("[ADS] Click tracking error:",t),e.json({error:"Failed to track click"},500)}});f.get("/api/ads/campaign/:campaignId/analytics",async e=>{try{const t=e.req.param("campaignId"),r=await e.env.DB.prepare(`
      SELECT 
        id, campaign_name, status,
        budget_total, budget_spent,
        impressions, clicks,
        pricing_model, cpm_rate, cpc_rate,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE id = ?
    `).bind(t).first();if(!r)return e.json({error:"Campaign not found"},404);const s=r.impressions>0?(r.clicks/r.impressions*100).toFixed(2):0,n=r.clicks>0?(r.budget_spent/r.clicks).toFixed(2):0,a=r.budget_total-r.budget_spent,o=(r.budget_spent/r.budget_total*100).toFixed(1);return e.json({success:!0,campaign:{...r,metrics:{ctr:`${s}%`,avgCostPerClick:`₦${n}`,budgetRemaining:`₦${a.toFixed(2)}`,percentSpent:`${o}%`}}})}catch(t){return console.error("[ADS] Analytics error:",t),e.json({error:"Failed to get analytics"},500)}});f.get("/api/ads/advertiser/:advertiserId/campaigns",async e=>{try{const t=e.req.param("advertiserId"),r=await e.env.DB.prepare(`
      SELECT 
        id, campaign_name, status,
        budget_total, budget_spent,
        impressions, clicks,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE advertiser_id = ?
      ORDER BY created_at DESC
    `).bind(t).all();return e.json({success:!0,campaigns:r.results||[]})}catch(t){return console.error("[ADS] Get campaigns error:",t),e.json({error:"Failed to get campaigns"},500)}});f.get("*",e=>e.req.path.startsWith("/api/")||e.req.path.startsWith("/static/")?e.notFound():e.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amebo - 🇳🇬 Earn Tokens · Buy Data</title>
        <link rel="icon" type="image/png" href="/static/amebo-logo.png">
        <link rel="apple-touch-icon" href="/static/amebo-logo.png">
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <div id="app"></div>
        
        <script src="/static/crypto-v2.js"><\/script>
        <script src="/static/app-v3.js?v=20251220-v8"><\/script>
        <script>
            const app = new SecureChatApp();
            app.init();
        <\/script>
    </body>
    </html>
  `));const Je=new Et,wr=Object.assign({"/src/index.tsx":f});let Tt=!1;for(const[,e]of Object.entries(wr))e&&(Je.all("*",t=>{let r;try{r=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,r)}),Je.notFound(t=>{let r;try{r=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,r)}),Tt=!0);if(!Tt)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{Je as default};
